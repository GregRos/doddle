import { Pulled } from "./types";
import { Lazy } from "./lazy";

/**
 * The stage of a lazily initialized value.
 */
export type LazyStage = "lazy" | "pending" | "done" | "failed";

/**
 * An interface that represents a lazily initialized value.
 */
export interface LazyLike<T> {
    /**
     * Tells the object to pull a value.
     * @throws Error The error thrown during initialization, if any.
     */
    pull(): Pulled<T>;
}

/**
 * The initializer function for a lazy value.
 */
export type LazyInitializer<T> = () => T | Lazy<T>;

export type LazyAsyncLike<T> = LazyLike<PromiseLike<T>>;
