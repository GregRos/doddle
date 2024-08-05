import { type Lazy, lazy, ownerInstance } from "./lazy"

/**
 * Memoizes the given function, caching its result and making sure it's only executed once. Uses
 * {@link Lazy} under the hood.
 *
 * @example
 *     // Synchronous memoization:
 *     let count = 0
 *     const func = () => count++
 *     const memFunc = memoize(func) satisfies () => number
 *     memFunc() // 0
 *     memFunc() // 0
 *     // Asynchronous memoization:
 *     let count = 0
 *     const func = async () => count++
 *     const memFunc = memoize(func) satisfies () => Promise<number>
 *     await memFunc() // 0
 *
 * @param definition The function to memoize. It can be synchronous, asynchronous, or return a lazy
 *   primitive.
 * @returns A function that will execute the memoized function and return its result.
 */

export function memoize<T>(definition: 0 extends 1 & T ? any : never): () => any
export function memoize<T extends Lazy<Promise<any>>>(definition: () => T): () => Lazy.Pulled<T>
export function memoize<T extends Lazy<Promise<any>>>(definition: () => T): () => Lazy.Pulled<T>
export function memoize<T extends Lazy<any>>(definition: () => T): () => Lazy.Pulled<T>
export function memoize<T>(definition: () => T): () => T
export function memoize<T>(definition: () => T): () => T {
    // Don't double memoize
    if (ownerInstance in definition) {
        return definition as any
    }
    return lazy(definition).pull as any
}
