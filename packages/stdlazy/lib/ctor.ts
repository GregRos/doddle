import { Lazy, ownerInstance } from "./lazy"
import { LazyAsync, Pulled } from "./types"

/**
 * A constructor for a lazily initialized primitive, backed by an initializer function that will
 * only be executed once. It will intelligently construct a synchronous {@link Lazy} or an
 * asynchronous {@link LazyAsync} based on the return type of the function.
 *
 * This constructor will flatten various nestings of {@link Lazy} and {@link Promise}, such as async
 * functions returning other lazy primitives, in the same way that {@link Promise} will flatten
 * nested promises.
 *
 * @example
 *     // Simple initializer:
 *     const regular = lazy(() => 1) satisfies Lazy<number>
 *     // Initializer returning another lazily primitive is flattened:
 *     const lazyNested = lazy(() => lazy(() => 1)) satisfies Lazy<number>
 *     // Async initializer gives a `LazyAsync` instance:
 *     const lazyAsync = lazy(async () => 1) satisfies LazyAsync<number>
 *     // Async initializer returning another lazily primitive is flattened:
 *     const asyncLazy = lazy(async () => lazy(() => 1)) satisfies LazyAsync<number>
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
 * Memoizes the given function, caching its result and making sure it's only executed once.
 *
 * Internally, the function generates a {@link Lazy} instance to handle the memoization. This allows
 * the benefit of using the library without needing to expose its types in your own interfaces.
 *
 * To accomplish this, the return type will try to avoid using utility types like {@link Pulled} and
 * {@link PulledAwaited} as much as possible. However, if the return value of the function explicitly
 * involves an {@link Lazy}, those utility types will be used to ensure the return type is properly
 * flattened.
 *
 * This does mean that generic types can lead to unsoundness in some cases.
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
