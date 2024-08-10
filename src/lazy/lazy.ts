import { cannotRecurseSync } from "../errors/error.js"
import {
    getClassName,
    getFunctionName,
    isAsyncIterable,
    isIterable,
    isLazy,
    isThenable
} from "../utils.js"
import assemble from "./operators/assemble.js"
import each from "./operators/each.js"
import equals from "./operators/equals.js"
import map from "./operators/map.js"
import zip from "./operators/zip.js"
export const methodName = Symbol("methodName")
export const ownerInstance = Symbol("ownerInstance")

/**
 * A TypeScript-first lazy evaluation primitive. An object that will only evaluate its initializer
 * function when the {@link pull} method is called.
 *
 * The initializer can return another {@link Lazy}, which will be chained like a promise.
 */
export class Lazy<T> implements Iterable<_IterationType<T>>, AsyncIterable<_IterationType<T>> {
    /** The cached value or error, stored from a previous execution of the initializer. */
    private _cached?: any
    private _info: Lazy.InnerInfo
    private _cacheName!: string
    get info(): Readonly<Lazy.Info> {
        const { stage, syncness, name } = this._info
        const syncnessWord = ["untouched", "sync", "async"][syncness]
        const syncnessPart = syncness === Lazy.Syncness.Untouched ? [] : [syncnessWord]
        const stageWord = ["untouched", "executing", "done", "threw"][stage]
        const stagePart = stage === Lazy.Stage.Done ? this._cacheName : `<${stageWord}>`
        const namePart = name ? `lazy(${name})` : "lazy"

        return {
            isReady: stage >= Lazy.Stage.Done,
            desc: [namePart, ...syncnessPart, stagePart].join(" "),
            stage: stageWord,
            syncness: syncnessWord,
            name
        }
    }
    /**
     * The initializer function that will be called to construct the value. It will be cleared after
     * the value is constructed, unless `LAZY_NOCLEAR` is set.
     */
    private _init: null | ((...args: any[]) => T)

    protected constructor(initializer: (...args: any[]) => any) {
        this._info = {
            syncness: Lazy.Syncness.Untouched,
            stage: Lazy.Stage.Untouched,
            name: getFunctionName(initializer)
        }
        this._init = initializer

        for (const method of operators) {
            const bound = method.bind(this)
            Object.defineProperty(bound, ownerInstance, { value: this })
            ;(this as any)[method.name] = bound
        }
    }

    static create<T>(f: () => T): Lazy<T> {
        return new Lazy(f)
    }

    map!: typeof map
    each!: typeof each
    zip!: typeof zip
    assemble!: typeof assemble
    equals!: typeof equals;
    *[Symbol.iterator]() {
        const inner = this.pull()
        if (isIterable(inner)) {
            yield* inner as Iterable<_IterationType<T>>
        } else {
            yield inner as _IterationType<T>
        }
    }
    async *[Symbol.asyncIterator]() {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        const inner = await this.pull()
        if (isAsyncIterable(inner) || isIterable(inner)) {
            yield* inner as Iterable<_IterationType<T>>
        } else {
            yield inner as _IterationType<T>
        }
    }
    /** Returns a short description of the Lazy value and its state. */
    toString() {
        return this.info.desc
    }

    /**
     * Evaluates this {@link Lazy} instance, flattening any nested {@link Lazy} or {@link Promise}
     * types.
     *
     * @returns The value produced by the initializer, after flattening any nested {@link Lazy} or
     *   {@link Promise} instances.
     * @throws The error thrown during initialization, if any.
     */
    pull(): Lazy.Pulled<T> {
        const info = this._info
        if (info.stage === Lazy.Stage.Threw) {
            throw this._cached
        }
        if (info.stage === Lazy.Stage.Executing) {
            if (info.syncness === Lazy.Syncness.Async) {
                return this._cached
            } else {
                throw cannotRecurseSync()
            }
        }
        if (info.stage === Lazy.Stage.Done) {
            return this._cached!
        }
        info.stage = Lazy.Stage.Executing
        let resource: any
        try {
            const result = this._init!()
            resource = isLazy(result) ? result.pull() : result
        } catch (e) {
            this._cached = e
            info.stage = Lazy.Stage.Threw
            throw e
        }
        // No need to keep holding a reference to the constructor.
        this._init = null

        if (isThenable(resource)) {
            info.syncness = Lazy.Syncness.Async
            resource = resource.then(value => {
                if (isLazy(value)) {
                    value = value.pull()
                }
                info.stage = Lazy.Stage.Done
                this._cacheName = getClassName(value)
                return value
            })
        } else {
            info.syncness = Lazy.Syncness.Sync
            info.stage = Lazy.Stage.Done
            this._cacheName = getClassName(resource)
        }
        this._cached = resource

        return resource
    }

    get [Symbol.toStringTag]() {
        return this.toString()
    }
}

const operators = [map, each, zip, assemble, equals, Lazy.prototype.pull] as Function[]
/**
 * Creates a lazy primitive around the given function, making sure it's only executed once. Works
 * for both synchronous and asynchronous evaluation.
 *
 * @example
 *     // Simple initializer:
 *     const regular = lazy(() => 1) satisfies Lazy<number>
 *
 *     // Initializer returning another lazily primitive is flattened:
 *     const lazyNested = lazy(() => lazy(() => 1)) satisfies Lazy<number>
 *
 *     // Async initializer gives a `LazyAsync` instance:
 *     const lazyAsync = lazy(async () => 1) satisfies LazyAsync<number>
 *
 *     // Async initializer returning another lazily primitive is flattened:
 *     const asyncLazy = lazy(async () => lazy(() => 1)) satisfies LazyAsync<number>
 *
 *     // Async initializer returning another lazily async primitive is flattened:
 *     const asyncLazyAsync = lazy(async () => lazy(async () => 1)) satisfies LazyAsync<number>
 *
 * @param initializer An initializer function that will be executed once to produce the value. Can
 *   be synchronous or asynchronous and will also handle nested lazy primitives.
 */

export function lazy<X>(initializer: () => Promise<LazyAsync<X>>): LazyAsync<X>
export function lazy<X>(initializer: () => Promise<Lazy<X>>): LazyAsync<X>

export function lazy<X>(initializer: () => Promise<X>): LazyAsync<X>

export function lazy<T>(initializer: () => Lazy<T>): Lazy<T>
export function lazy<T>(initializer: () => T | Lazy<T>): Lazy<T>
export function lazy<T>(initializer: () => T | Lazy<T>): Lazy<T> {
    return Lazy.create(initializer) as any
}

export namespace Lazy {
    export const enum Stage {
        Untouched = 0,
        Executing = 1,
        Done = 2,
        Threw = 3
    }
    export const enum Syncness {
        Untouched = 0,
        Sync = 1,
        Async = 2
    }
    export interface InnerInfo {
        syncness: Syncness
        stage: Stage
        name: string | null
    }
    export interface Info {
        readonly isReady: boolean
        readonly stage: string
        readonly syncness: string
        readonly name: string | null
        readonly desc: string
    }
    export type Pulled<T> =
        T extends PromiseLike<infer X>
            ? Promise<PulledAwaited<X>>
            : T extends Lazy<infer X>
              ? Pulled<X>
              : T

    export type PulledAwaited<T> =
        T extends Lazy<infer R>
            ? PulledAwaited<R>
            : T extends Promise<infer R>
              ? PulledAwaited<R>
              : T
}

export type LazyAsync<T> = Lazy<Promise<T>>

/** The stage of a lazily initialized value. */

/** An interface that represents a lazily initialized value. */

export type _IterationType<T> = T extends Iterable<infer R> ? R : T
export type _AsyncIterationType<T> = T extends AsyncIterable<infer R> ? R : T
