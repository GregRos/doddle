import { cannotRecurseSync, chk, loadCheckers } from "../errors/error.js"
import {
    getClassName,
    getFunctionName,
    isLazy,
    isThenable,
    type MaybeLazy,
    type MaybePromise
} from "../utils.js"
export const methodName = Symbol("methodName")
export const ownerInstance = Symbol("ownerInstance")

type IsAnyPureAsync<T extends Lazy<any>[], IfTrue, IfFalse> = {
    [K in keyof T]: T[K] extends LazyAsync<any> ? K : never
}[number] extends never
    ? IfFalse
    : IfTrue

type IsAnyMixed<T extends Lazy<any>[], IfTrue, IfFalse> =
    LazyAsync<any> extends T[number] ? IfTrue : IfFalse

type OnlyIfMixed<Input, LazyType = Lazy<Input>> = Promise<any> extends Input ? LazyType : never
/**
 * A TypeScript-first lazy evaluation primitive. An object that will only evaluate its initializer
 * function when the {@link pull} method is called.
 *
 * The initializer can return another {@link Lazy}, which will be chained like a promise.
 */
export class Lazy<T> {
    /** The cached value or error, stored from a previous execution of the initializer. */
    private _cached?: any
    private _info: InnerInfo
    private _cacheName!: string
    get info(): Readonly<Lazy.Info> {
        const { stage, syncness, name } = this._info
        const syncnessWord = ["untouched", "sync", "async"][syncness]
        const syncnessPart = syncness === Syncness.Untouched ? [] : [syncnessWord]
        const stageWord = ["untouched", "executing", "done", "threw"][stage]
        const stagePart = stage === Stage.Done ? this._cacheName : `<${stageWord}>`
        const namePart = name ? `lazy(${name})` : "lazy"

        return {
            isReady: stage >= Stage.Done,
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
            syncness: Syncness.Untouched,
            stage: Stage.Untouched,
            name: getFunctionName(initializer)
        }
        this._init = initializer

        for (const name of ["map", "each", "zip", "catch", "pull"]) {
            const bound = (this as any)[name].bind(this)
            Object.defineProperty(bound, ownerInstance, { value: this })
            ;(this as any)[name] = bound
        }
        loadCheckers(this)
    }

    static create<T>(f: () => T): Lazy<T> {
        return new Lazy(f)
    }

    // When the projection is async, the result is always LazyAsync, no matter
    // what the `this` is.
    map<T, R>(
        this: Lazy<T>,
        projection: (value: Lazy.PulledAwaited<T>) => Lazy.SomeAsync<R>
    ): LazyAsync<R>
    // When the input is async, and the projection is mixed, the result is always async.
    map<T, R>(
        this: OnlyIfMixed<R, LazyAsync<T>>,
        projection: (value: Lazy.PulledAwaited<T>) => R | Lazy<R>
    ): LazyAsync<Awaited<R>>
    map<T, R>(
        this: LazyAsync<T>,
        projection: (value: Lazy.PulledAwaited<T>) => Lazy<R> | R
    ): LazyAsync<R>

    // When this is mixed, and the projection is also mixed, the result type should stay the same.
    map<T, R>(
        this: OnlyIfMixed<T> & OnlyIfMixed<R, Lazy<T>>,
        projection: (value: Lazy.PulledAwaited<T>) => R | Lazy<R>
    ): Lazy<R>
    // When `this` is mixed and the projection is sync, the sync result needs to be mixed.
    map<T, R>(
        this: OnlyIfMixed<T>,
        projection: (value: Lazy.PulledAwaited<T>) => R | Lazy<R>
    ): Lazy<R | Promise<R>>
    map<T, R>(this: Lazy<T>, projection: (value: Lazy.PulledAwaited<T>) => R | Lazy<R>): Lazy<R>
    map(this: Lazy<any>, projection: (a: any) => any): any {
        const _projection = chk(this.map).projection(projection)
        return lazy(() => {
            const pulled = this.pull()
            if (isThenable(pulled)) {
                return pulled.then(_projection)
            }
            return _projection(pulled)
        })
    }

    // async.catch(async) = async
    catch<T, R>(
        this: LazyAsync<T>,
        handler: (error: any) => Lazy.SomeAsync<R>
    ): LazyAsync<T | Awaited<R>>
    // async.catch(mixed) = async
    catch<T, R>(
        this: LazyAsync<T>,
        handler: (error: any) => R | Lazy<R> | Lazy.SomeAsync<R>
    ): LazyAsync<T | Awaited<R>>
    // sync.catch(async) = mixed
    // sync.catch(sync) = sync
    // mixed.catch(mixed) = mixed
    // mixed.catch(sync) = mixed
    catch<R>(handler: (error: any) => R | Lazy<R>): Lazy<T | R>
    catch(handler: (error: any) => any): any {
        chk(this.catch).handler(handler)
        return lazy(() => {
            try {
                const pulled = this.pull()
                if (isThenable(pulled)) {
                    return pulled.then(undefined, handler)
                }
                return pulled
            } catch (e) {
                return handler(e)
            }
        })
    }

    // mixed.each(async) = async
    each<T>(
        this: OnlyIfMixed<T>,
        action: (value: Lazy.PulledAwaited<T>) => Lazy.SomeAsync<void>
    ): LazyAsync<Awaited<T>>
    // async.each(anything) = async
    each<T>(
        this: LazyAsync<T>,
        action: (value: Lazy.PulledAwaited<T>) => void | Lazy<void> | Lazy.SomeAsync<void>
    ): LazyAsync<T>
    // mixed.each(mixed | sync) = mixed
    each<T>(
        this: OnlyIfMixed<T>,
        action: (value: Lazy.PulledAwaited<T>) => void | Lazy<void> | Lazy.SomeAsync<void>
    ): Lazy<T>
    // sync.each(async) = async
    each<T>(
        this: Lazy<T>,
        action: (value: Lazy.PulledAwaited<T>) => Lazy.SomeAsync<void>
    ): LazyAsync<T>
    // sync.each(mixed) = mixed
    each<T, R>(
        this: OnlyIfMixed<R, Lazy<T>>,
        action: (value: Lazy.PulledAwaited<T>) => R | Lazy<R>
    ): Lazy<T | Promise<T>>
    // sync.each(sync) = sync
    each<T>(this: Lazy<T>, action: (value: Lazy.PulledAwaited<T>) => void | Lazy<void>): Lazy<T>

    each(this: any, action: (value: any) => any): any {
        chk(this.each).action(action)
        return this.map((x: any) => {
            const result = action(x)
            return lazy(() => {
                return result
            }).map(() => x)
        })
    }

    zip<const Others extends readonly [Lazy<any>, ...Lazy<any>[]]>(
        ...others: Others
    ): IsAnyPureAsync<
        [Lazy<T>, ...Others],
        LazyAsync<
            [
                Lazy.PulledAwaited<T>,
                ...{
                    [K in keyof Others]: Lazy.PulledAwaited<Others[K]>
                }
            ]
        >,
        IsAnyMixed<
            [Lazy<T>, ...Others],
            Lazy<
                MaybePromise<
                    [
                        Lazy.PulledAwaited<T>,
                        ...{
                            [K in keyof Others]: Lazy.PulledAwaited<Others[K]>
                        }
                    ]
                >
            >,
            Lazy<
                [
                    Lazy.Pulled<T>,
                    ...{
                        [K in keyof Others]: Lazy.Pulled<Others[K]>
                    }
                ]
            >
        >
    >

    zip(this: Lazy<any>, ...others: Lazy<any>[]): any {
        return lazy(() => {
            const values = [this, ...others].map(x => x.pull())
            if (values.some(isThenable)) {
                return Promise.all(values)
            }
            return values
        })
    }

    /** Returns a short description of the Lazy value and its state. */
    toString() {
        return this.info.desc
    }

    memoize(): () => T {
        return this.pull as any
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
        if (info.stage === Stage.Threw) {
            throw this._cached
        }
        if (info.stage === Stage.Executing) {
            if (info.syncness === Syncness.Async) {
                return this._cached
            } else {
                throw cannotRecurseSync()
            }
        }
        if (info.stage === Stage.Done) {
            return this._cached!
        }
        info.stage = Stage.Executing
        let resource: any
        try {
            const result = this._init!()
            resource = isLazy(result) ? result.pull() : result
        } catch (e) {
            this._cached = e
            info.stage = Stage.Threw
            throw e
        }
        // No need to keep holding a reference to the constructor.
        this._init = null

        if (isThenable(resource)) {
            info.syncness = Syncness.Async
            resource = resource.then(value => {
                if (isLazy(value)) {
                    value = value.pull()
                }
                info.stage = Stage.Done
                this._cacheName = getClassName(value)
                return value
            })
        } else {
            info.syncness = Syncness.Sync
            info.stage = Stage.Done
            this._cacheName = getClassName(resource)
        }
        this._cached = resource

        return resource
    }

    get [Symbol.toStringTag]() {
        return this.toString()
    }
}
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
    if (ownerInstance in initializer) {
        return initializer[ownerInstance] as any
    }
    return Lazy.create(initializer) as any
}
const enum Stage {
    Untouched = 0,
    Executing = 1,
    Done = 2,
    Threw = 3
}
const enum Syncness {
    Untouched = 0,
    Sync = 1,
    Async = 2
}
interface InnerInfo {
    syncness: Syncness
    stage: Stage
    name: string | null
}
export namespace Lazy {
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

    export type SomeAsync<T> = Promise<T> | LazyAsync<T> | Promise<Lazy<T>> | Promise<LazyAsync<T>>
    export type MaybePromised<T> = MaybePromise<LazyAsync<T> | MaybeLazy<T>>
}

export type LazyAsync<T> = Lazy<Promise<T>>

/** The stage of a lazily initialized value. */

/** An interface that represents a lazily initialized value. */

export type _IterationType<T> = T extends string ? T : T extends Iterable<infer R> ? R : T
export type _AsyncIterationType<T> = T extends AsyncIterable<infer R> ? R : T

export function lazyFromOperator<In, Out>(
    operand: In,
    func: (input: In) => Out | Lazy.Pulled<Out>
): Lazy<Out> {
    const lz = lazy(() => func.call(operand, operand)) as any
    Object.assign(lz, {
        operator: func.name,
        operand
    })
    return lz
}

export function pull<T>(input: 1 extends 0 & T ? T : never): any
export function pull<T>(input: T): Lazy.Pulled<T>
export function pull<T>(input: Lazy<T> | T): Lazy.Pulled<T> {
    return lazy(() => input).pull()
}
