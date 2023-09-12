import { LazyLike } from "./lazy//lazy-like";
import { Lazy, Pulled } from ".";

export function getClassName(something: any) {
    if (typeof something !== "object") {
        return typeof something;
    }
    if (something === null) {
        return "null";
    }
    const ctorName =
        something.constructor?.name ??
        something?.[Symbol.toStringTag] ??
        "Object";
    return ctorName;
}

/**
 * Checks if the given value is a LazyLike, i.e. that it
 * has a `pull` method.
 * @param what The value to check.
 */
export function isLazyLike<T = unknown>(what: unknown): what is LazyLike<T> {
    return (
        typeof what === "object" &&
        what != null &&
        "pull" in what &&
        typeof what?.pull === "function"
    );
}

/**
 * Checks if the given value is a thenable.
 * @param what The value to check.
 */
export function isThenable<T = unknown>(what: unknown): what is PromiseLike<T> {
    return (
        typeof what === "object" &&
        !!what &&
        "then" in what &&
        typeof what.then === "function"
    );
}

export function isLazy(value: any): value is Lazy<any> {
    return typeof value === "object" && value != null && value instanceof Lazy;
}

export function isIterable<T>(value: any): value is Iterable<T> {
    return (
        typeof value === "object" &&
        value != null &&
        typeof value[Symbol.iterator] === "function"
    );
}

export function isAsyncIterable<T>(value: any): value is AsyncIterable<T> {
    return (
        typeof value === "object" &&
        value != null &&
        typeof value[Symbol.asyncIterator] === "function"
    );
}

export function isNextable<T>(value: any): value is Iterator<T> {
    // Checks if value is an iterator
    return typeof value === "object" && value && "next" in value && typeof value.next === "function"
}

export function pull<T>(value: Pulled<T>): Pulled<T>
export function pull<T>(value: T | LazyLike<T>): Pulled<T>;
export function pull<T>(value: T | LazyLike<T> | Pulled<T>): Pulled<T> {
    return isLazyLike(value) ? value.pull() : value as any;
}