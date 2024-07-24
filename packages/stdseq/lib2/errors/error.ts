import { isAsyncIterable, isIterable } from "stdlazy/lib/utils"

export class DawdleError extends Error {
    constructor(code: string, message: string) {
        super(message)
        this.name = code
    }
}

const BAD_ARGUMENT = "call/bad-argument"
const BAD_RETURN = "call/bad-return"
const NOT_ENOUGH_ELEMENTS = "seq/not-enough-elements"

export function notEnoughElements(where: string, found: number, expected: number) {
    throw new DawdleError(
        NOT_ENOUGH_ELEMENTS,
        `Expected ${where} to have at least ${expected} elements, but found only ${found}`
    )
}

function argNotExpected(expected: string, check: (value: unknown) => boolean) {
    return function (name: string, value: unknown) {
        if (!check(value)) {
            throw new DawdleError(
                BAD_ARGUMENT,
                `Argument '${name}' must be ${expected}, but got ${value}`
            )
        }
    }
}

function argExpectedReturn<T = unknown>(expected: string, check: (value: any) => value is T) {
    return function (name: string, value: any): value is T {
        if (!check(value)) {
            throw new DawdleError(
                BAD_RETURN,
                `Function argument ${name} expected to return ${expected}, but got ${value}`
            )
        }
        return true
    }
}
export const mustBeNumber = argNotExpected(
    "a number",
    (value: unknown) => typeof value === "number"
)

export const mustBeNatural = argNotExpected(
    "a natural number",
    (value: unknown) => typeof value === "number" && value >= 0 && Number.isInteger(value)
)

export const mustBeInteger = argNotExpected(
    "an integer",
    (value: unknown) => typeof value === "number" && Number.isInteger(value)
)

export const mustBeString = argNotExpected(
    "a string",
    (value: unknown) => typeof value === "string"
)

export const mustBeBoolean = argNotExpected(
    "a boolean",
    (value: unknown) => typeof value === "boolean"
)

export const mustBeFunction = argNotExpected(
    "a function",
    (value: unknown) => typeof value === "function"
)

export const mustBeIterable = argNotExpected("an iterable", isIterable)

export const mustBeAsyncIterable = argNotExpected("an async iterable", isAsyncIterable)

export const mustBeOneOf = <T,>(...options: T[]) => {
    const description = `one of ${options.map(x => `'${x}'`).join(", ")}`
    return argNotExpected(description, (value: unknown) => options.includes(value as T))
}

export const mustReturnComparable = argExpectedReturn(
    "a comparable value",
    (value: any): value is string | number | boolean | bigint => {
        return ["string", "number", "boolean", "bigint"].includes(typeof value)
    }
)
export const mustReturnArray = argExpectedReturn("an array", Array.isArray)

export function mustReturnTuple(length: number) {
    return function (name: string, value: unknown) {
        if (!Array.isArray(value) || value.length !== length) {
            throw new DawdleError(
                BAD_RETURN,
                `Function argument ${name} expected to return a tuple of length ${length}, but got ${value}`
            )
        }
        return true
    }
}
