import { chk, DoddleError, loadCheckers } from "../errors/error.js"
import {
    getClassName,
    getValueDesc,
    isDoddle,
    isFunction,
    isThenable,
    type MaybeDoddle,
    type MaybePromise
} from "../utils.js"
import type { Is_Any_Mixed, Is_Any_Pure_Async, Matches_Mixed_Value } from "./helpers.js"
export const ownerInstance = Symbol("ownerInstance")

/**
 * A TypeScript-first doddle evaluation primitive. An object that will only evaluate its initializer
 * function when the {@link pull} method is called.
 *
 * The initializer can return another {@link Doddle}, which will be chained like a promise.
 *
 * @category Use
 */
export class Doddle<T> {
    private _cacheName!: string

    /** The cached value or error, stored from a previous execution of the initializer. */
    private _cached?: any
    private _info: InnerInfo
    /**
     * The initializer function that will be called to construct the value. It will be cleared after
     * the value is constructed.
     */
    private _init: null | ((...args: any[]) => T)

    /** @ignore */
    constructor(initializer: (...args: any[]) => any) {
        this._info = {
            syncness: Syncness.Untouched,
            stage: Stage.Untouched
        }
        this._init = initializer

        for (const name of ["map", "do", "zip", "catch", "pull"] as const) {
            const bound = (this as any)[name].bind(this)
            bound[ownerInstance] = this
            this[name] = bound
        }
        loadCheckers(this)
    }

    /** @internal */
    get [Symbol.toStringTag]() {
        return "Doddle"
    }

    /** Returns metadata about the current state of the Doddle. */
    get info(): Readonly<Doddle.Metadata> {
        const { stage, syncness } = this._info
        const syncnessWord = ["untouched", "sync", "async"][syncness]
        const syncnessPart = syncness === Syncness.Untouched ? [] : [syncnessWord]
        const stageWord = ["untouched", "executing", "done", "threw"][stage]
        const stagePart = stage === Stage.Done ? this._cacheName : `<${stageWord}>`

        return {
            isReady: stage >= Stage.Done,
            desc: ["doddle", ...syncnessPart, stagePart].join(" "),
            stage: stageWord,
            syncness: syncnessWord
        }
    }
    /**
     * Returns a new {@link Doddle} based on this one. When pulled, it will pull `this` and yield the
     * same value. If an error occurs, the handler will be called with the error. The doddle then
     * yields whatever the handler returns.
     *
     * You can pass an async handler only if `this` is async too.
     *
     * @example
     *     const d = doddle(() => {
     *         throw new Error("Oops")
     *     })
     *     const handled = d.catch(error => {
     *         console.error(error)
     *         return 42
     *     })
     *     const pulled = handled.pull()
     *     console.log(pulled) // 42
     *
     *     // async Doddles allow an async handler:
     *     const d = doddle(async () => {
     *         throw new Error("Oops")
     *     })
     *     const handled = d.catch(async error => {
     *         console.error(error)
     *         return 42
     *     })
     *     const pulled = await handled.pull()
     *     console.log(pulled) // 42
     *
     *     // @ts-expect-error but passing an async handler for a sync doddle isn't allowed.
     *     const d = doddle(() => 1).catch(async () => 2)
     *
     * @param this The Doddle instance.
     * @param handler The error handler function.
     */
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

    /**
     * Returns a new {@link Doddle} based on this one. When pulled, it will pull `this` and invoke
     * the given action function as a side-effect. It will then yield whatever `this` did.
     *
     * If the action returns a Promise, it will be awaited before yielding the result, making the
     * returned Doddle async.
     *
     * @param action The action to perform.
     */
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

    /**
     * Creates a new {@link Doddle} based on `this`. When pulled, it will pull `this` and project the
     * result using the given function.
     *
     * When `this` is async, the projection will be passed the awaited value, and the function will
     * return an async Doddle. It also happens if you pass an async projection.
     *
     * @example
     *     // Sync inputs:
     *     const d = doddle(() => 42)
     *     const mapped = d.map(x => x + 1)
     *     const pulled = mapped.pull()
     *     console.log(pulled) // 43
     *
     *     // async inputs:
     *     const d = doddle(async () => 42)
     *     const mapped = d.map(x => x + 1) // note that the awaited value is used
     *     const pulled = await mapped.pull()
     *     console.log(pulled) // 43
     *
     *     // async projection:
     *     const d = doddle(() => 42)
     *     const mapped = d.map(async x => x + 1)
     *     const pulled = await mapped.pull()
     *     console.log(pulled) // 43
     *
     * @param projection The function to apply to the pulled value.
     */
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

    /**
     * Returns a memoized function, which acts like this Doddle while hiding its type.
     *
     * @returns A memoized function that pulls `this` and returns its result.
     */
    memoize(): () => T {
        return this.pull as any
    }

    /**
     * Evaluates this {@link Doddle} instance, flattening any nested {@link Doddle} or {@link Promise}
     * types and yielding its value.
     *
     * @returns The yielded value.
     * @throws The error thrown during initialization, if any.
     */
    pull(): Doddle.Pulled<T> {
        const info = this._info

        if (info.stage === Stage.Executing) {
            if (info.syncness === Syncness.Async) {
                return this._cached
            } else {
                throw new DoddleError(
                    `Tried to call 'Doddle.pull' recursively in a sync context, which would not terminate.`
                )
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

    /** Returns a short description of the Doddle value and its state. */
    toString() {
        return this.info.desc
    }

    /**
     * Returns a new Doddle based on this one, together with the input Doddles. When pulled, it will
     * pull `this` and all `others`, yielding their results in an array.
     *
     * If either `this` or any of `others` is async, the resulting Doddle will also be async.
     *
     * @param others The other Doddles to zip with.
     */
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
}
/**
 * Creates a {@link Doddle} lazy primitive initialized with the given function. Supports both sync
 * and async initializers and flattens nested Doddle or {@link Promise} types.
 *
 * See examples for usage.
 *
 * @category Create
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
    if (!isFunction(initializer)) {
        throw new Error(`Initializer must be a function, but got ${getValueDesc(initializer)}`)
    }
    if (ownerInstance in initializer) {
        return initializer[ownerInstance] as any
    }
    return new Doddle(initializer) as any
}

/**
 * Doddle utility functions.
 *
 * @category Create
 */
export namespace doddle {
    export const is = isDoddle
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
    stage: Stage
    syncness: Syncness
}
/**
 * Doddle utility types.
 *
 * @category Types
 */
export namespace Doddle {
    /** An metadata object describing the state of a {@link Doddle} instance. */
    export interface Metadata {
        /** A human-readable representation of the Doddle's state. */
        readonly desc: string
        /** Whether the Doddle has already been pulled. */
        readonly isReady: boolean
        /** The current stage of the Doddle's execution. */
        readonly stage: string
        /** Whether the Doddle is sync or async (or whether it's unknown). */
        readonly syncness: string
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
            : T extends PromiseLike<infer R>
              ? PulledAwaited<R>
              : T

    /** An async value or a {@link Doddle} that can be pulled to get an async value. */
    export type SomeAsync<T> =
        | PromiseLike<T>
        | DoddleAsync<T>
        | PromiseLike<Doddle<T>>
        | PromiseLike<DoddleAsync<T>>

    /** A value, a promise, a doddle, an async doddle, or similar nestings. */
    export type MaybePromised<T> = MaybePromise<DoddleAsync<T> | MaybeDoddle<T>>
}

/**
 * An async {@link Doddle}, which is just a `Doddle<Promise<T>>`.
 *
 * @category Use
 */
export type DoddleAsync<T> = Doddle<Promise<T>>

/** @internal */
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
 * @category Use
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
