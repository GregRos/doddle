import { Lazy, ownerInstance } from "./lazy"
import { LazyAsync, Pulled } from "./types"

/**
 * Reduces an async function that returns a lazy async value to a lazy async value.
 *
 * @example
 *
 * @param initializer The async function that returns a lazy async value.
 */
export function lazy<X>(initializer: () => Promise<Lazy<Promise<X>>>): LazyAsync<X>
export function lazy<X>(initializer: () => Promise<Lazy<X>>): LazyAsync<X>

export function lazy<X>(initializer: () => Promise<LazyAsync<X>>): LazyAsync<X>
export function lazy<X>(initializer: () => Promise<X>): LazyAsync<X>
export function lazy<T>(initializer: () => T | Lazy<T>): Lazy<T>
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
