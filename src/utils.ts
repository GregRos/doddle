import { Lazy } from "./lazy"

export function isIterable<T>(value: any): value is Iterable<T> {
    return (
        typeof value === "object" && value != null && typeof value[Symbol.iterator] === "function"
    )
}

export function isAsyncIterable<T>(value: any): value is AsyncIterable<T> {
    return (
        typeof value === "object" &&
        value != null &&
        typeof value[Symbol.asyncIterator] === "function"
    )
}

export function isNextable<T>(value: any): value is Iterator<T> | AsyncIterator<T> {
    // Checks if value is an iterator
    return typeof value === "object" && value && "next" in value && typeof value.next === "function"
}

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

export function getInitializerName(initializer: (...args: any[]) => any) {
    return initializer.name || null
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

export function returnKvp(input: any, key: any, value: any) {
    if (isAsyncIterable(input) && isThenable(key)) {
        return key.then(key => ({
            key: key,
            value: value
        })) as Promise<any>
    }
    return {
        key: key,
        value: value
    }
}
