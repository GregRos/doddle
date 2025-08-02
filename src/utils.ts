import { pull, type Doddle, type DoddleAsync } from "./doddle/index.js"
import type { DoddleReadableStream } from "./readable-stream-polyfill.js"

export function _iter<T>(input: Iterable<T>): Iterator<T> {
    return (input as any)[Symbol.iterator]()
}

export function _aiter<T>(input: AsyncIterable<T>): AsyncIterator<T> {
    return (input as any)[Symbol.asyncIterator]()
}

export function _xiter<T>(input: Iterable<T> | AsyncIterable<T>): Iterator<T> | AsyncIterator<T> {
    return isAsyncIterable(input) ? _aiter(input) : _iter(input)
}

export function isObject<T>(value: T): value is T & {} {
    return typeof value === "object" && value != null
}

export function isFunction(value: any): value is (...args: any[]) => any {
    return typeof value === "function"
}

export function isArrayLike<T>(value: any): value is ArrayLike<T> {
    return isObject(value) && isInt(value.length)
}

export function isIterable<T>(value: any): value is Iterable<T> {
    return isObject(value) && isFunction(value[Symbol.iterator])
}

export const orderedStages = [undefined, "before", "after", "both"] as const

export const isInt = Number.isSafeInteger
export const isBool = (value: boolean) => !!value === value
export const isPair = (value: any) => Array.isArray(value) && value.length === 2
export const isPosInt = (value: number) => isInt(value) && value > 0
export const enum Stage {
    Before = 1,
    After = 2,
    Both = 3
}

export function isAsyncIterable<T>(value: any): value is AsyncIterable<T> {
    return isObject(value) && isFunction(value[Symbol.asyncIterator])
}

export function isReadableStream(value: any): value is DoddleReadableStream<unknown> {
    return isObject(value) && isFunction(value.getReader)
}

export function isNextable<T>(value: any): value is Iterator<T> | AsyncIterator<T> {
    // Checks if value is an iterator
    return isObject(value) && isFunction(value.next)
}

export function getClassName(something: any): string {
    if (something === null) {
        return "null"
    }
    if (!isObject(something)) {
        return typeof something
    }
    const ctorName = something.constructor?.name ?? something?.[Symbol.toStringTag] ?? "Object"
    return ctorName
}

export function getValueDesc(object: any) {
    if (object == null) {
        return `${object}`
    }
    if (isFunction(object)) {
        return `function ${object.name || "<anonymous>"}`
    }
    if (typeof object === "bigint") {
        return `${object}n`
    }
    if (typeof object === "symbol") {
        return object.description
    }
    if (typeof object === "string") {
        if (object.length > 30) {
            object = object.slice(0, 30) + "⋯"
        }
        return `"${object}"`
    }
    if (isObject(object)) {
        if (isDoddle(object)) {
            return object.toString()
        }
        if (isNextable(object)) {
            return `iterator ${getClassName(object)}`
        } else if (isIterable(object)) {
            return `iterable ${getClassName(object)}`
        } else if (isAsyncIterable(object)) {
            return `async iterable ${getClassName(object)}`
        } else if (isDoddle(object)) {
            return object.toString()
        } else if (isThenable(object)) {
            return `a Promise`
        } else {
            return `object ${getClassName(object)}`
        }
    }
    return `${object}`
}

/**
 * Checks if the given value is a thenable.
 *
 * @param what The value to check.
 */
export function isThenable<T = unknown>(what: unknown): what is PromiseLike<T> {
    return isObject(what) && isFunction((what as any).then)
}

export function isDoddle<T>(value: any): value is Doddle<T> {
    return isObject(value) && isFunction(value.pull)
}

export function returnKvp(input: any, key: any, value: any) {
    key = pull(key)
    if (isAsyncIterable(input) && isThenable(key)) {
        return key.then(key => [pull(key), value])
    }
    return [key, value]
}
export type MaybePromise<T> = T | Promise<T>
export type MaybeDoddle<T> = T | Doddle<T> | DoddleAsync<T>

export function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}

export function createCompare(desc: boolean) {
    const baseCompare = (a: any, b: any) => (desc ? -1 : 1) * (a < b ? -1 : a > b ? 1 : 0)
    return (a: any, b: any) => {
        if (Array.isArray(a) && Array.isArray(b)) {
            for (let i = 0; i < a.length; i++) {
                const result = baseCompare(a[i], b[i])
                if (result !== 0) {
                    return result
                }
            }
            return 0
        }
        return baseCompare(a, b)
    }
}

export function createCompareKey(desc: boolean) {
    const compare = createCompare(desc)
    return (a: any, b: any) => {
        return compare(a[0], b[0])
    }
}
