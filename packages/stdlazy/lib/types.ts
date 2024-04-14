import { Lazy } from "./lazy"

export type Pulled<T> =
    T extends PromiseLike<infer X>
        ? Promise<PulledAwaited<X>>
        : T extends Lazy<infer X>
          ? Pulled<X>
          : T

export type PulledAwaited<T> =
    T extends Lazy<infer R> ? PulledAwaited<R> : T extends Promise<infer R> ? PulledAwaited<R> : T

export type ReplaceValue<Lz, T> =
    Lz extends Lazy<infer R>
        ? Lazy<ReplaceValue<R, T>>
        : Lz extends Promise<infer R>
          ? Promise<ReplaceValue<R, T>>
          : T
export type LazyAsync<T> = Lazy<Promise<T>>
export function getClassName(something: any) {
    if (typeof something !== "object") {
        return typeof something
    }
    if (something === null) {
        return "null"
    }
    const ctorName = something.constructor?.name ?? something?.[Symbol.toStringTag] ?? "Object"
    return ctorName
}

export function getInitializerName(initializer: Function) {
    return initializer.name || null
}
/**
 * Checks if the given value is a LazyLike, i.e. that it has a `pull` method.
 *
 * @param what The value to check.
 */
export function isPullable<T = unknown>(what: unknown): what is Pullable<T> {
    return (
        typeof what === "object" &&
        what != null &&
        "pull" in what &&
        typeof what?.pull === "function"
    )
}

/**
 * Checks if the given value is a thenable.
 *
 * @param what The value to check.
 */
export function isThenable<T = unknown>(what: unknown): what is PromiseLike<T> {
    return typeof what === "object" && !!what && "then" in what && typeof what.then === "function"
}

export function isLazy(value: any): value is Lazy<any> {
    return typeof value === "object" && value != null && value instanceof Lazy
}

/** The stage of a lazily initialized value. */
export type LazyStage = "pending" | "pulled" | "ready" | "failed"
export type LazySyncness = "sync" | "async" | "pending"
/** An interface that represents a lazily initialized value. */
export interface Pullable<T> {
    /**
     * Tells the object to pull a value.
     *
     * @throws Error The error thrown during initialization, if any.
     */
    pull(): Pulled<T>
}

/** The initializer function for a lazy value. */
export type LazyInitializer<T> = () => T | Lazy<T>

export type LazyAsyncLike<T> = Pullable<PromiseLike<T>>
export interface LazyInfo {
    stage: LazyStage
    syncness: LazySyncness
    name: string | null
}
