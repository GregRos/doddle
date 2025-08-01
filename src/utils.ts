import { type Doddle, type DoddleAsync } from "./doddle/index.js"
import { type Text } from "./errors/error.js"
import type { DoddleReadableStream } from "./readable-stream-polyfill.js"
import {
    syAsyncIterator,
    syIterator,
    syToStringTag,
    wAfter,
    wAnonymous,
    wAsyncIterable,
    wBefore,
    wBigInt,
    wBoth,
    wConstructor,
    wDescription,
    wFunction,
    wIterable,
    wIterator,
    wLength,
    wNull,
    wObject,
    wPromise,
    wString,
    wSymbol,
    wToString
} from "./words.js"

export function _iter<T>(input: Iterable<T>): Iterator<T> {
    return (input as any)[syIterator]()
}

export function _aiter<T>(input: AsyncIterable<T>): AsyncIterator<T> {
    return (input as any)[syAsyncIterator]()
}

export function _xiter<T>(input: Iterable<T> | AsyncIterable<T>): Iterator<T> | AsyncIterator<T> {
    return isAsyncIterable(input) ? _aiter(input) : _iter(input)
}

export function isObject<T>(value: T): value is T & {} {
    return typeof value === wObject && value != null
}

export function isFunction(value: any): value is (...args: any[]) => any {
    return typeof value === wFunction
}
export function isDoddle<T>(value: any): value is Doddle<T> {
    return isObject(value) && isFunction(value.pull) && isFunction(value.map)
}
export function isArrayLike<T>(value: any): value is ArrayLike<T> {
    return isObject(value) && isInt(getLength(value))
}

export function getLength<T extends { length: any }>(value: T): T["length"] {
    return value[wLength]
}

export function isIterable<T>(value: any): value is Iterable<T> {
    return isObject(value) && isFunction(value[syIterator])
}
export function isAnyIterable(value: any): value is Iterable<any> {
    return isIterable(value) || isAsyncIterable(value)
}
const orderedStages = [undefined, wBefore, wAfter, wBoth]
export const parseStage = (value: (typeof orderedStages)[number]): Stage => {
    return orderedStages.indexOf(value)
}
export const isStage = (value: any) => {
    const parsed = parseStage(value)
    return parsed > 0 && parsed <= 3
}

export const isNumber = (v: number) => +v === v
export const isInt = Number.isSafeInteger
export const isIntOrInfinity = (v: number) => isInt(v) || v === Infinity
export const isNatOrInfinity = (v: number) => isIntOrInfinity(v) && v >= 0
export const isBool = (value: boolean) => !!value === value
export const isNotNullish = (value: any) => value != null
export const isPair = (value: any) => isArray(value) && value.length === 2
export const isPosInt = (value: number) => isInt(value) && value > 0
export const isError = (value: any) => value instanceof Error
export const isSymbol = (value: any) => typeof value === wSymbol
export const enum Stage {
    Before = 1,
    After = 2,
    Both = 3
}

export function isAsyncIterable<T>(value: any): value is AsyncIterable<T> {
    return isObject(value) && isFunction(value[syAsyncIterator])
}

export function isReadableStream(value: any): value is DoddleReadableStream<unknown> {
    return isObject(value) && isFunction(value.getReader)
}

export function isBigInt(value: any): value is bigint {
    return typeof value === wBigInt
}

export function isString(value: any): value is string {
    return typeof value === wString
}
export function isPropertyKey(value: any): value is PropertyKey {
    return isString(value) || isSymbol(value) || isNumber(value)
}

export function isNullish(value: any): value is null | undefined {
    return value == null
}

export function isNextable<T>(value: any): value is Iterator<T> | AsyncIterator<T> {
    // Checks if value is an iterator
    return isObject(value) && isFunction(value.next)
}

export function getClassName(something: any) {
    if (!isObject(something)) {
        return typeof something
    }
    if (something === null) {
        return wNull
    }
    const ctorName = something[wConstructor]?.name ?? something?.[syToStringTag] ?? wObject
    return ctorName
}

export function getSymbolDescription(symbol: symbol) {
    return `${wSymbol}(${symbol[wDescription]})`
}

export function getObjDesc(object: any) {
    if (isDoddle(object)) {
        return object[wToString]()
    }
    const cName = getClassName(object)
    if (isIterable(object)) {
        return `${wIterable} ${cName}`
    } else if (isAsyncIterable(object)) {
        return `${wAsyncIterable} ${cName}`
    } else if (isNextable(object)) {
        return `${wIterator} ${cName}`
    } else if (isThenable(object)) {
        return `a ${wPromise}`
    } else {
        return `${wObject} ${cName}`
    }
}
export function getValueDesc(object: any) {
    if (isNullish(object)) {
        return `${object}`
    }
    if (isFunction(object)) {
        return `${wFunction} ${getFunctionName(object) || wAnonymous}`
    }
    if (isBigInt(object)) {
        return `${object}n`
    }
    if (isSymbol(object)) {
        return getSymbolDescription(object)
    }
    if (isString(object)) {
        if (getLength(object) > 30) {
            object = object.slice(0, 30) + "⋯"
        }
        return `"${object}"`
    }
    if (isObject(object)) {
        return getObjDesc(object)
    }
    return `${object}`
}

export function getFunctionName(initializer: Function) {
    return initializer.name || null
}

/**
 * Checks if the given value is a thenable.
 *
 * @param what The value to check.
 */
export function isThenable<T = unknown>(what: unknown): what is PromiseLike<T> {
    return isObject(what) && isFunction((what as any).then)
}

export const isArray = Array.isArray

export type MaybePromise<T> = T | Promise<T>
export type MaybeDoddle<T> = T | Doddle<T> | DoddleAsync<T>
export function getThrownError(thrown: unknown) {
    return thrown instanceof Error ? thrown : new Error(String(thrown))
}
export function shuffleArray<T>(array: T[]) {
    for (let i = getLength(array) - 1; i > 0; i--) {
        const j = floor(random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}

function createBaseCompare(desc: boolean) {
    return (a: any, b: any) => (desc ? -1 : 1) * (a < b ? -1 : a > b ? 1 : 0)
}

export function createCompare(desc: boolean) {
    const baseCompare = createBaseCompare(desc)
    return (a: any, b: any) => {
        if (isArray(a) && isArray(b)) {
            for (let i = 0; i < getLength(a); i++) {
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
        return compare(a.key, b.key)
    }
}
export function splat(bits: Text): string {
    if (!isArray(bits)) {
        return bits as string
    }
    return bits.flat(5).join(" ")
}

export const promiseAll = Promise.all.bind(Promise)
export const assign = Object.assign
export const fromEntries = Object.fromEntries
export const defineProperty = Object.defineProperty
export const keys = Object.keys
export const entries = Object.entries
export const setTimeout = globalThis.setTimeout
export const promise = <T>(
    executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void
) => {
    return new Promise<T>(executor)
}
export const defineValueProperty = (target: any, key: PropertyKey, value: any) => {
    defineProperty(target, key, {
        value
    })
}
export const getOwnPropertyNames = Object.getOwnPropertyNames
export function createOperator(name: string, ctor: any, key: PropertyKey) {
    return {
        [name](operand: any, impl: any) {
            const myAbstractSeq = assign(new ctor(), [impl.name, operand])
            defineProperty(myAbstractSeq, key, {
                get(this: typeof myAbstractSeq) {
                    return impl.bind(this, this[1])
                }
            })
            return myAbstractSeq
        }
    }[name]
}
export function setClassName(cls: any, name: string) {
    if (cls.name === name) {
        return
    }
    defineProperty(cls, "name", {
        value: name
    })
}
export const floor = Math.floor
export const sign = Math.sign
export const abs = Math.abs
export const random = Math.random
