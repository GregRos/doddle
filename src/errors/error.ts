import { getClassName } from "../utils"

export class DawdleError extends Error {
    constructor(code: string, message: string) {
        super(message)
        this.name = code
    }
}

const BAD_ARGUMENT = "call/bad-argument"
const BAD_RETURN = "call/bad-return"
function argNotExpected(expected: string, check: (value: unknown) => boolean) {
    return function (name: string, value: unknown) {
        if (!check(value)) {
            throw new TypeError(`Argument '${name}' must be ${expected}, but got ${value}`)
        }
    }
}

export const mustBeNatural = argNotExpected(
    "a natural number",
    (value: unknown) => typeof value === "number" && value >= 0 && Number.isInteger(value)
)

export const mustBePositiveInt = argNotExpected(
    "positive",
    (value: unknown) => typeof value === "number" && value > 0 && Number.isInteger(value)
)

export const mustBeInteger = argNotExpected(
    "an integer",
    (value: unknown) => typeof value === "number" && Number.isInteger(value)
)

export const mustBeBoolean = argNotExpected(
    "a boolean",
    (value: unknown) => typeof value === "boolean"
)

export const mustBeFunction = argNotExpected(
    "a function",
    (value: unknown) => typeof value === "function"
)

export const mustBeOneOf = <T,>(...options: T[]) => {
    const description = `one of ${options.map(x => `'${x}'`).join(", ")}`
    return argNotExpected(description, (value: unknown) => options.includes(value as T))
}

export const mustNotBeNullish = argNotExpected(
    "not null or undefined",
    (value: unknown) => value != null
)

export function mustNotReturnNullish<T = unknown>(name: string, value: T): T {
    if (value == null) {
        throw new TypeError(
            `Function argument ${name} expected to return a non-nullish value, but got ${value}`
        )
    }
    return value
}

export function mustReturnTuple(length: number) {
    return function (name: string, value: unknown) {
        if (!Array.isArray(value) || value.length !== length) {
            throw new TypeError(
                `Function argument ${name} expected to return a tuple of length ${length}, but got ${value}`
            )
        }
        return true
    }
}

export function gotNonIterable(object: object, syncness: "sync" | "async", description: string) {
    return new TypeError(
        `Tried to convert ${getClassName(object)} to an ${syncness === "sync" ? "" : "(async) "}iterable, but ${description}`
    )
}
export function cannotRecurseSync(): Error {
    return new DawdleError(
        "lazies/recursed",
        "Cannot call `pull` in a synchronous context when the initializer is running."
    )
}
