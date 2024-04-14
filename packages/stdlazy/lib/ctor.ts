import { Lazy, ownerInstance } from "./lazy"
import { LazyAsync, Pulled } from "./types"

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
export function lazy<T>(initializer: () => T): Lazy<T>
export function lazy<T>(initializer: () => T | Lazy<T>): Lazy<T> {
    return Lazy.create(initializer) as any
}

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
export function memoize<T extends Lazy<Promise<any>>>(definition: () => T): () => Pulled<T>
export function memoize<T extends Lazy<Promise<any>>>(definition: () => T): () => Pulled<T>
export function memoize<T extends Lazy<any>>(definition: () => T): () => Pulled<T>
export function memoize<T>(definition: () => T): () => T
export function memoize<T>(definition: () => T): () => T {
    // Don't double memoize
    if (ownerInstance in definition) {
        return definition as any
    }
    return lazy(definition).pull as any
}
