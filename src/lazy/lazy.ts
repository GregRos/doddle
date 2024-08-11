import { cannotRecurseSync } from "../errors/error.js"
import {
    getClassName,
    getFunctionName,
    isAsyncIterable,
    isIterable,
    isLazy,
    isThenable
} from "../utils.js"
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

        for (const name of ["map", "each", "zip", "assemble", "pull", "equals"]) {
            const bound = (this as any)[name].bind(this)
            Object.defineProperty(bound, ownerInstance, { value: this })
            ;(this as any)[name] = bound
        }
    }

    static create<T>(f: () => T): Lazy<T> {
        return new Lazy(f)
    }

    /**
     * Creates a new {@link Lazy} primitive that, when pulled, will pull **this** and return its
     * result, projected using the given function. If the Lazy primitive is async, the projection
     * will receive the awaited value.
     *
     * @example
     *     // sync projectionL
     *     const sync = lazy(() => "hello").map(x => `${x} world`) satisfies Lazy<string>
     *     expect(sync.pull()).toBe("hello world")
     *
     *     // sync projection on async lazy:
     *     const async = lazy(async () => [1]).map(x => [...x, 2]) satisfies LazyAsync<number[]>
     *     await expect(async.pull()).resolves.toBe(2)
     *
     *     // async projection on sync lazy:
     *     const nested = lazy(() => 1).map(async x => x + 1) satisfies LazyAsync<number>
     *     await expect(nested.pull()).resolves.toBe(2)
     *
     *     // async projection on async lazy:
     *     const asyncToAsync = lazy(async () => 1).map(
     *         async x => x + 1
     *     ) satisfies LazyAsync<number>
     *     await expect(asyncToAsync.pull()).resolves.toBe(2)
     *
     * @param projection The to apply to the value of the Lazy primitive. It will flatten any nested
     *   {@link Lazy} and {@link Promise} instances.
     * @summary
     * Projects the result of this {@link Lazy} primitive using the given function.
     * @see {@link Array.map} for a similar method on arrays.
     * @see {@link Promise.then} for a similar method on promises.
     * @see {@link Lazy.each} for a similar method that doesn't change the result.
     */
    map<T, R>(
        this: LazyAsync<T>,
        projection: (value: Lazy.PulledAwaited<T>) => Promise<LazyAsync<R>>
    ): LazyAsync<R>
    map<T, Y>(
        this: LazyAsync<T>,
        projection: (value: Lazy.PulledAwaited<T>) => Promise<LazyAsync<Y>>
    ): LazyAsync<Y>
    map<T, X>(
        this: LazyAsync<T>,
        projection: (value: Lazy.PulledAwaited<T>) => Promise<Lazy<X>>
    ): LazyAsync<X>
    map<T, X>(
        this: LazyAsync<T>,
        projection: (value: Lazy.PulledAwaited<T>) => Promise<X>
    ): LazyAsync<X>
    map<T, X>(
        this: LazyAsync<T>,
        projection: (value: Lazy.PulledAwaited<T>) => LazyAsync<X>
    ): LazyAsync<X>
    map<T, R>(this: LazyAsync<T>, f: (value: Lazy.PulledAwaited<T>) => Lazy<R>): LazyAsync<R>
    map<T, R>(this: LazyAsync<T>, f: (value: Lazy.PulledAwaited<T>) => R): LazyAsync<R>
    map<T, Y>(
        this: Lazy<T>,
        projection: (value: Lazy.PulledAwaited<T>) => Promise<LazyAsync<Y>>
    ): LazyAsync<Y>
    map<T, X>(
        this: Lazy<T>,
        projection: (value: Lazy.PulledAwaited<T>) => Promise<Lazy<X>>
    ): LazyAsync<X>
    map<T, X>(this: Lazy<T>, projection: (value: Lazy.PulledAwaited<T>) => Promise<X>): LazyAsync<X>
    map<T, R>(this: Lazy<T>, projection: (value: Lazy.PulledAwaited<T>) => Lazy<R>): Lazy<R>
    map<T, R>(this: Lazy<T>, projection: (value: Lazy.PulledAwaited<T>) => R): Lazy<R>
    map(this: Lazy<any>, projection: (a: any) => any): any {
        return lazy(() => {
            const pulled = this.pull()
            if (isThenable(pulled)) {
                return pulled.then(projection)
            }
            return projection(pulled)
        })
    }
    /**
     * Creates a new {@link Lazy} primitive that, when pulled, will pull **this** and apply the given
     * callback to the result. The new {@link Lazy} will still return the same value as **this**,
     * only waiting for the handler to finish first.
     *
     * @example
     *     const lazy = lazy(() => 1).do(x => console.log(x)) satisfies Lazy<number>
     *     expect(lazy.pull()).toBe(1) // Logs "1" to the console as a side effect.
     *     const wait30 = lazy(() => 1).do(
     *         async x => new Promise(r => setTimeout(r, 30))
     *     ) satisfies Lazy<number>
     *     await expect(wait30.pull()).resolves.toBe(1) // Waits 30ms before returning 1.
     *
     * @param callback The callback
     * @summary Applies the given callback to the result of this {@link Lazy} primitive.
     */
    each<S>(
        this: LazyAsync<S>,
        action: (
            value: S
        ) => any | Lazy<any> | Promise<any> | Promise<LazyAsync<any>> | LazyAsync<any>
    ): LazyAsync<S>
    each<T>(
        this: Lazy<T>,
        action: (value: Lazy.PulledAwaited<T>) => Promise<any> | LazyAsync<any>
    ): LazyAsync<T>
    each<T>(this: Lazy<T>, action: (value: Lazy.PulledAwaited<T>) => Lazy<any>): Lazy<T>
    each<T>(this: Lazy<T>, action: (value: Lazy.PulledAwaited<T>) => any): Lazy<T>
    each<T>(this: LazyAsync<T>, action: (value: any) => any): any {
        return this.map(x => {
            const result = action(x)
            return lazy(() => {
                return result
            }).map(() => x)
        })
    }
    /**
     * Zips **this** {@link Lazy} primitive with one or more others, returning a new {@link Lazy}
     * that, when pulled, will pull all of them and return an array with the results. If any
     * primitive involved is async, the new {@link Lazy} will also be async.
     *
     * @example
     *     const a = lazy(() => 1).zip(lazy(() => 2)) satisfies Lazy<[number, number]>
     *     expect(a.pull()).toEqual([1, 2])
     *
     *     const b = lazy(async () => 1).zip(lazy(() => 2)) satisfies LazyAsync<[number, number]>
     *     await expect(b.pull()).resolves.toEqual([1, 2])
     *
     * @param others One or more {@link Lazy} primitives to zip with **this**.
     * @summary Turns multiple lazy values into a single lazy value producing an array.
     */
    zip<Others extends readonly [Lazy<any>, ...Lazy<any>[]]>(
        ...others: Others
    ): LazyAsync<any> extends [this, ...Others][number]
        ? LazyAsync<
              [
                  Lazy.PulledAwaited<T>,
                  ...{
                      [K in keyof Others]: Lazy.PulledAwaited<Others[K]>
                  }
              ]
          >
        : Lazy<
              [
                  Lazy.Pulled<T>,
                  ...{
                      [K in keyof Others]: Lazy.Pulled<Others[K]>
                  }
              ]
          >

    zip(this: Lazy<any>, ...others: Lazy<any>[]): Lazy<any> {
        return lazy(() => {
            const values = [this, ...others].map(x => x.pull())
            if (values.some(isThenable)) {
                return Promise.all(values)
            }
            return values
        })
    }
    /**
     * Takes an key-value object with {@link Lazy} values and returns a new {@link Lazy} that, when
     * pulled, will pull all of them and return an object with the same keys, but with the values
     * replaced by the pulled results. If any of the values are async, the new {@link Lazy} will also
     * be async.
     *
     * The value of **this** {@link Lazy} will be available under the key `"this"`.
     *
     * @example
     *     const self = lazy(() => 1).assemble({
     *         a: lazy(() => 2),
     *         b: lazy(() => 3)
     *     })
     *     expect(self.pull()).toEqual({ this: 1, a: 2, b: 3 })
     *
     *     const asyncSelf = lazy(async () => 1).assemble({
     *         a: lazy(() => 2),
     *         b: lazy(() => 3)
     *     })
     *     await expect(asyncSelf.pull()).resolves.toEqual({ this: 1, a: 2, b: 3 })
     *
     * @param assembly An object with {@link Lazy} values.
     * @returns A new {@link Lazy} primitive that will return an object with the same keys as the
     *   input object, plus the key `"this"`, with the pulled results.
     * @summary Converts an object of {@link Lazy} values into a {@link Lazy} value producing an object.
     */ assemble<T, X extends Record<keyof X, Lazy<unknown>>>(
        this: Lazy<T>,
        assembly: X
    ): LazyAsync<any> extends X[keyof X] | Lazy<T>
        ? LazyAsync<
              {
                  [K in keyof X]: Lazy.PulledAwaited<X[K]>
              } & {
                  this: Lazy.PulledAwaited<T>
              }
          >
        : Lazy<
              {
                  [K in keyof X]: Lazy.Pulled<X[K]>
              } & {
                  this: Lazy.Pulled<T>
              }
          > {
        return lazy(() => {
            const keys = ["this", ...Object.keys(assembly)]
            const values = [this, ...Object.values(assembly)].map((x: any) => x.pull())
            if (values.some(isThenable)) {
                return Promise.all(values).then(values =>
                    keys.reduce((acc, key, i) => {
                        acc[key] = values[i]
                        return acc
                    }, {} as any)
                )
            }
            return values.reduce((acc, value, i) => {
                acc[keys[i]] = value
                return acc
            }, {} as any)
        }) as any
    }
    equals<T extends Other, Other>(
        this: LazyAsync<T>,
        other: Lazy<Other> | Other
    ): LazyAsync<boolean>
    equals<T extends Other, Other>(this: LazyAsync<T>, other: LazyAsync<Other>): LazyAsync<boolean>
    equals<T extends Other, Other>(this: Lazy<T>, other: LazyAsync<Other>): LazyAsync<boolean>
    equals<T extends Other, Other>(this: Lazy<T>, other: Other | Lazy<Other>): Lazy<boolean>
    equals<T, Other extends T>(this: LazyAsync<T>, other: Lazy<Other> | Other): LazyAsync<boolean>
    equals<T, Other extends T>(this: LazyAsync<T>, other: LazyAsync<Other>): LazyAsync<boolean>
    equals<T, Other extends T>(this: Lazy<T>, other: LazyAsync<Other>): LazyAsync<boolean>
    equals<T, Other extends T>(this: Lazy<T>, other: Other | Lazy<Other>): Lazy<boolean>
    equals<T>(this: Lazy<T>, other: any): any {
        return this.zip(lazy(() => other) as any).map(([a, b]) => a === b)
    }
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
