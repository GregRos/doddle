import { Lazy } from "./lazy";

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

/** The stage of a lazily initialized value. */
export type LazyStage = "untouched" | "executing" | "done" | "threw"
export type LazySyncness = "sync" | "async" | "untouched"
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
export type CompleteLazyInitializer<F extends (...args: any[]) => any> = {
    name?: string
    function: F
    thisArg: ThisParameterType<F>
} & (Parameters<F> extends [] ? {} : { args: Parameters<F> })
export type LazyAsyncLike<T> = Pullable<PromiseLike<T>>
export interface LazyInfo {
    isReady: boolean
    stage: LazyStage
    syncness: LazySyncness
    name: string | null
}

export type _IterationType<T> = T extends Iterable<infer R> ? R : T
export type _AsyncIterationType<T> = T extends AsyncIterable<infer R> ? R : T
