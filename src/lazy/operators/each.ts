import type { Lazy, LazyAsync } from "../lazy.js"
import { lazy } from "../lazy.js"

/**
 * Creates a new {@link Lazy} primitive that, when pulled, will pull **this** and apply the given
 * callback to the result. The new {@link Lazy} will still return the same value as **this**, only
 * waiting for the handler to finish first.
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
function each<S>(
    this: LazyAsync<S>,
    action: (value: S) => any | Lazy<any> | Promise<any> | Promise<LazyAsync<any>> | LazyAsync<any>
): LazyAsync<S>
function each<T>(
    this: Lazy<T>,
    action: (value: Lazy.PulledAwaited<T>) => Promise<any> | LazyAsync<any>
): LazyAsync<T>
function each<T>(this: Lazy<T>, action: (value: Lazy.PulledAwaited<T>) => Lazy<any>): Lazy<T>
function each<T>(this: Lazy<T>, action: (value: Lazy.PulledAwaited<T>) => any): Lazy<T>
function each<T>(this: LazyAsync<T>, action: (value: any) => any): any {
    return this.map(x => {
        const result = action(x)
        return lazy(() => {
            return result
        }).map(() => x)
    })
}

export default each
