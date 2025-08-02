import { cannotRecurseSync, chk, loadCheckers } from "../errors/error.js"
import {
    getClassName,
    getFunctionName,
    getValueDesc,
    isDoddle,
    isThenable,
    setClassName,
    type MaybeDoddle,
    type MaybePromise
} from "../utils.js"
import type { Is_Any_Mixed, Is_Any_Pure_Async, Matches_Mixed_Value } from "./helpers.js"
export const methodName = Symbol("methodName")
export const ownerInstance = Symbol("ownerInstance")

/**
 * A TypeScript-first doddle evaluation primitive. An object that will only evaluate its initializer
 * function when the {@link pull} method is called.
 *
 * The initializer can return another {@link Doddle}, which will be chained like a promise.
 */
export class Doddle<T> {
    /** The cached value or error, stored from a previous execution of the initializer. */
    private _cached?: any
    private _info: InnerInfo
    private _cacheName!: string
    get info(): Readonly<Doddle.Metadata> {
        const { stage, syncness, name } = this._info
        const syncnessWord = ["untouched", "sync", "async"][syncness]
        const syncnessPart = syncness === Syncness.Untouched ? [] : [syncnessWord]
        const stageWord = ["untouched", "executing", "done", "threw"][stage]
        const stagePart = stage === Stage.Done ? this._cacheName : `<${stageWord}>`
        const namePart = name ? `doddle(${name})` : "doddle"

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

        for (const name of ["map", "do", "zip", "catch", "pull"]) {
            const bound = (this as any)[name].bind(this)
            Object.defineProperty(bound, ownerInstance, { value: this })
            ;(this as any)[name] = bound
        }
        loadCheckers(this)
    }

    static create<T>(f: () => T): Doddle<T> {
        return new Doddle(f)
    }

    // When the projection is async, the result is always DoddleAsync, no matter
    // what the `this` is.
    map<T, R>(
        this: Doddle<T>,
        projection: (value: Doddle.PulledAwaited<T>) => Doddle.SomeAsync<R>
    ): DoddleAsync<R>
    // When the input is async, and the projection is mixed, the result is always async.
    map<T, R>(
        this: Matches_Mixed_Value<R, DoddleAsync<T>>,
        projection: (value: Doddle.PulledAwaited<T>) => R | Doddle<R>
    ): DoddleAsync<Awaited<R>>
    map<T, R>(
        this: DoddleAsync<T>,
        projection: (value: Doddle.PulledAwaited<T>) => Doddle<R> | R
    ): DoddleAsync<R>

    // When this is mixed, and the projection is also mixed, the result type should stay the same.
    map<T, R>(
        this: Matches_Mixed_Value<T> & Matches_Mixed_Value<R, Doddle<T>>,
        projection: (value: Doddle.PulledAwaited<T>) => R | Doddle<R>
    ): Doddle<R>
    // When `this` is mixed and the projection is sync, the sync result needs to be mixed.
    map<T, R>(
        this: Matches_Mixed_Value<T>,
        projection: (value: Doddle.PulledAwaited<T>) => R | Doddle<R>
    ): Doddle<R | Promise<R>>
    map<T, R>(
        this: Doddle<T>,
        projection: (value: Doddle.PulledAwaited<T>) => R | Doddle<R>
    ): Doddle<R>
    map(this: Doddle<any>, projection: (a: any) => any): any {
        const _projection = chk(this.map).projection(projection)
        return doddle(() => {
            const pulled = this.pull()
            if (isThenable(pulled)) {
                return pulled.then(_projection)
            }
            return _projection(pulled)
        })
    }

    catch<T, R>(
        this: DoddleAsync<T>,
        handler: (error: any) => Doddle.SomeAsync<R>
    ): DoddleAsync<T | Awaited<R>>
    catch<T, R>(
        this: DoddleAsync<T>,
        handler: (error: any) => R | Doddle<R> | Doddle.SomeAsync<R>
    ): DoddleAsync<T | Awaited<R>>
    catch<T, R>(
        this: Matches_Mixed_Value<T>,
        handler: (error: any) => Doddle.SomeAsync<R>
    ): Doddle<T | Promise<R>>
    catch<T, R>(this: Matches_Mixed_Value<T>, handler: (error: any) => R | Doddle<R>): Doddle<T | R>
    catch<R>(
        handler: R extends PromiseLike<any> ? never : (error: any) => R | Doddle<R>
    ): Doddle<R | T>
    catch(handler: (error: any) => any): any {
        chk(this.catch).handler(handler)
        return doddle(() => {
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

    // mixed.do(async) = async
    do<T>(
        this: Matches_Mixed_Value<T>,
        action: (value: Doddle.PulledAwaited<T>) => Doddle.SomeAsync<void>
    ): DoddleAsync<Awaited<T>>
    // async.do(anything) = async
    do<T>(
        this: DoddleAsync<T>,
        action: (value: Doddle.PulledAwaited<T>) => void | Doddle<void> | Doddle.SomeAsync<void>
    ): DoddleAsync<T>
    // mixed.do(mixed | sync) = mixed
    do<T>(
        this: Matches_Mixed_Value<T>,
        action: (value: Doddle.PulledAwaited<T>) => void | Doddle<void> | Doddle.SomeAsync<void>
    ): Doddle<T>
    // sync.do(async) = async
    do<T>(
        this: Doddle<T>,
        action: (value: Doddle.PulledAwaited<T>) => Doddle.SomeAsync<void>
    ): DoddleAsync<T>
    // sync.do(mixed) = mixed
    do<T, R>(
        this: Matches_Mixed_Value<R, Doddle<T>>,
        action: (value: Doddle.PulledAwaited<T>) => R | Doddle<R>
    ): Doddle<T | Promise<T>>
    // sync.do(sync) = sync
    do<T>(
        this: Doddle<T>,
        action: (value: Doddle.PulledAwaited<T>) => void | Doddle<void>
    ): Doddle<T>

    do(this: any, action: (value: any) => any): any {
        chk(this.do).action(action)
        return this.map((x: any) => {
            const result = action(x)
            return doddle(() => {
                return result
            }).map(() => x)
        })
    }

    zip<const Others extends readonly [Doddle<any>, ...Doddle<any>[]]>(
        ...others: Others
    ): Is_Any_Pure_Async<
        [Doddle<T>, ...Others],
        DoddleAsync<
            [
                Doddle.PulledAwaited<T>,
                ...{
                    [K in keyof Others]: Doddle.PulledAwaited<Others[K]>
                }
            ]
        >,
        Is_Any_Mixed<
            [Doddle<T>, ...Others],
            Doddle<
                MaybePromise<
                    [
                        Doddle.PulledAwaited<T>,
                        ...{
                            [K in keyof Others]: Doddle.PulledAwaited<Others[K]>
                        }
                    ]
                >
            >,
            Doddle<
                [
                    Doddle.Pulled<T>,
                    ...{
                        [K in keyof Others]: Doddle.Pulled<Others[K]>
                    }
                ]
            >
        >
    >

    zip(this: Doddle<any>, ...others: Doddle<any>[]): any {
        return doddle(() => {
            const values = [this, ...others].map(x => x.pull())
            if (values.some(isThenable)) {
                return Promise.all(values)
            }
            return values
        })
    }

    /** Returns a short description of the Doddle value and its state. */
    toString() {
        return this.info.desc
    }

    memoize(): () => T {
        return this.pull as any
    }

    /**
     * Evaluates this {@link Doddle} instance, flattening any nested {@link Doddle} or {@link Promise}
     * types.
     *
     * @returns The value produced by the initializer, after flattening any nested {@link Doddle} or
     *   {@link Promise} instances.
     * @throws The error thrown during initialization, if any.
     */
    pull(): Doddle.Pulled<T> {
        const info = this._info

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
            resource = isDoddle(result) ? result.pull() : result
        } finally {
            if (!resource) {
                info.stage = Stage.Threw
            }
        }
        // No need to keep holding a reference to the constructor.
        this._init = null

        if (isThenable(resource)) {
            info.syncness = Syncness.Async
            resource = resource.then(value => {
                if (isDoddle(value)) {
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
 * Creates a doddle primitive around the given function, making sure it's only executed once. Works
 * for both synchronous and asynchronous evaluation.
 *
 * @example
 *     // Simple initializer:
 *     const regular = doddle(() => 1) satisfies Doddle<number>
 *
 *     // Initializer returning another lazily primitive is flattened:
 *     const lazyNested = doddle(() => doddle(() => 1)) satisfies Doddle<number>
 *
 *     // Async initializer gives a `DoddleAsync` instance:
 *     const lazyAsync = doddle(async () => 1) satisfies DoddleAsync<number>
 *
 *     // Async initializer returning another lazily primitive is flattened:
 *     const asyncDoddle = doddle(async () => doddle(() => 1)) satisfies DoddleAsync<number>
 *
 *     // Async initializer returning another lazily async primitive is flattened:
 *     const asyncDoddleAsync = doddle(async () =>
 *         doddle(async () => 1)
 *     ) satisfies DoddleAsync<number>
 *
 * @param initializer An initializer function that will be executed once to produce the value. Can
 *   be synchronous or asynchronous and will also handle nested doddle primitives.
 */

export function doddle<X>(initializer: () => Promise<DoddleAsync<X>>): DoddleAsync<X>
export function doddle<X>(initializer: () => Promise<Doddle<X>>): DoddleAsync<X>
export function doddle<X>(initializer: () => Promise<X>): DoddleAsync<X>
export function doddle<T>(initializer: () => Doddle<T>): Doddle<T>
export function doddle<T>(initializer: () => T | Doddle<T>): Doddle<T>
export function doddle<T>(initializer: () => T | Doddle<T>): Doddle<T> {
    if (!initializer) {
        throw new Error(`Initializer must be a function, but got ${getValueDesc(initializer)}`)
    }
    if (ownerInstance in initializer) {
        return initializer[ownerInstance] as any
    }
    return Doddle.create(initializer) as any
}
export namespace doddle {
    export function is<T = unknown>(value: any): value is Doddle<T> {
        return isDoddle(value)
    }
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
export namespace Doddle {
    /** An metadata object describing the state of a {@link Doddle} instance. */
    export interface Metadata {
        readonly isReady: boolean
        readonly stage: string
        readonly syncness: string
        readonly name: string | null
        readonly desc: string
    }

    /**
     * Recursively pulls the result type of a {@link Doddle}, cutting thoruhg any {@link PromiseLike}
     * types. Returns an async representation if the input as async.
     */
    export type Pulled<T> =
        T extends PromiseLike<infer X>
            ? Promise<PulledAwaited<X>>
            : T extends Doddle<infer X>
              ? Pulled<X>
              : T

    /** Recursively pulls the result type of a {@link Doddle}, cutting through any {@link PromiseLike} */
    export type PulledAwaited<T> =
        T extends Doddle<infer R>
            ? PulledAwaited<R>
            : T extends Promise<infer R>
              ? PulledAwaited<R>
              : T

    /** An async value or a {@link Doddle} that can be pulled to get an async value. */
    export type SomeAsync<T> =
        | Promise<T>
        | DoddleAsync<T>
        | Promise<Doddle<T>>
        | Promise<DoddleAsync<T>>

    /** A value, a promise, a doddle, an async doddle, or similar nestings. */
    export type MaybePromised<T> = MaybePromise<DoddleAsync<T> | MaybeDoddle<T>>
}

/** An async {@link Doddle}, which is just a `Doddle<Promise<T>>`. */
export type DoddleAsync<T> = Doddle<Promise<T>>

export type _IterationType<T> = T extends string ? T : T extends Iterable<infer R> ? R : T
export type _AsyncIterationType<T> = T extends AsyncIterable<infer R> ? R : T

export function lazyOperator<In, Out>(
    operand: In,
    func: (input: In) => Out | Doddle.Pulled<Out>
): Doddle<Out> {
    const lz = doddle(() => func.call(operand, operand)) as any
    Object.assign(lz, {
        operator: func.name,
        operand
    })
    return lz
}

/**
 * Similar to `await`. Pulls a value from a {@link Doddle}, which may be async. The same as calling
 * {@link Doddle.pull} on the input.
 *
 * @param input
 */
export function pull<T>(input: 1 extends 0 & T ? T : never): any
/**
 * Similar to `await`. Pulls a value from a {@link Doddle}, which may be async. The same as calling
 * {@link Doddle.pull} on the input.
 *
 * @param input
 */
export function pull<T>(input: T): Doddle.Pulled<T>
export function pull<T>(input: Doddle<T> | T): Doddle.Pulled<T> {
    return doddle(() => input).pull()
}

// Class name is used for various checks
// Need to make sure it's accessible even while minified
setClassName(Doddle, "Doddle")
