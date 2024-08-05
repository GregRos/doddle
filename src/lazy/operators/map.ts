import { isThenable } from "../../utils"
import { lazy } from "../lazy"
import type { Lazy, LazyAsync } from "../lazy"

/**
 * Creates a new {@link Lazy} primitive that, when pulled, will pull **this** and return its result,
 * projected using the given function. If the Lazy primitive is async, the projection will receive
 * the awaited value.
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
 *     const asyncToAsync = lazy(async () => 1).map(async x => x + 1) satisfies LazyAsync<number>
 *     await expect(asyncToAsync.pull()).resolves.toBe(2)
 *
 * @param projection The function to apply to the value of the Lazy primitive. It will flatten any
 *   nested {@link Lazy} and {@link Promise} instances.
 * @summary
 * Projects the result of this {@link Lazy} primitive using the given function.
 * @see {@link Array.map} for a similar method on arrays.
 * @see {@link Promise.then} for a similar method on promises.
 * @see {@link Lazy.each} for a similar method that doesn't change the result.
 */
function map<T, S, R>(
    this: LazyAsync<S>,
    projection: (value: Lazy.PulledAwaited<S>) => Promise<LazyAsync<R>>
): LazyAsync<R>
function map<T, S, Y>(
    this: LazyAsync<S>,
    projection: (value: Lazy.PulledAwaited<S>) => Promise<LazyAsync<Y>>
): LazyAsync<Y>
function map<T, S, X>(
    this: LazyAsync<S>,
    projection: (value: Lazy.PulledAwaited<S>) => Promise<Lazy<X>>
): LazyAsync<X>
function map<T, S, X>(
    this: LazyAsync<S>,
    projection: (value: Lazy.PulledAwaited<S>) => Promise<X>
): LazyAsync<X>
function map<T, S, X>(
    this: LazyAsync<S>,
    projection: (value: Lazy.PulledAwaited<S>) => LazyAsync<X>
): LazyAsync<X>
function map<T, S, R>(
    this: LazyAsync<S>,
    f: (value: Lazy.PulledAwaited<S>) => Lazy<R>
): LazyAsync<R>
function map<T, S, R>(this: LazyAsync<S>, f: (value: Lazy.PulledAwaited<S>) => R): LazyAsync<R>
function map<T, Y>(
    this: Lazy<T>,
    projection: (value: Lazy.PulledAwaited<T>) => Promise<LazyAsync<Y>>
): LazyAsync<Y>
function map<T, X>(
    this: Lazy<T>,
    projection: (value: Lazy.PulledAwaited<T>) => Promise<Lazy<X>>
): LazyAsync<X>
function map<T, X>(
    this: Lazy<T>,
    projection: (value: Lazy.PulledAwaited<T>) => Promise<X>
): LazyAsync<X>
function map<T, R>(this: Lazy<T>, projection: (value: Lazy.PulledAwaited<T>) => Lazy<R>): Lazy<R>
function map<T, R>(this: Lazy<T>, projection: (value: Lazy.PulledAwaited<T>) => R): Lazy<R>
function map(this: Lazy<any>, projection: (a: any) => any): any {
    return lazy(() => {
        const pulled = this.pull()
        if (isThenable(pulled)) {
            return pulled.then(projection)
        }
        return projection(pulled)
    })
}

export default map
