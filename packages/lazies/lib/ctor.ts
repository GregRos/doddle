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
/** @param initializer An async function returning a {@link Lazy}. */
export function lazy<X>(initializer: () => Promise<Lazy<X>>): LazyAsync<X>

export function lazy<X>(initializer: () => Promise<X>): LazyAsync<X>

export function lazy<T>(initializer: () => Lazy<T>): Lazy<T>
export function lazy<T>(initializer: () => T): Lazy<T>
export function lazy<T>(initializer: () => T | Lazy<T>): Lazy<T> {
    return Lazy.create(initializer) as any
}

export function memoize<T>(definition: () => T): () => Pulled<T> {
    // Don't double memoize
    if (ownerInstance in definition) {
        return definition as any
    }
    return lazy(definition).pull
}

lazy(() => 5)
