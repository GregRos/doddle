import { getClassName, Stage } from "../utils.js"

const isBool = (value: any): value is boolean => !!value === value
const isInt = (value: any): value is number => Number.isSafeInteger(value)
const isPos = (value: any): value is number => isInt(value) && value > 0
export const wasnt = (what: string, name: string, expected: string, value: unknown): never => {
    throw new TypeError(`${what} '${name}' must be ${expected}, not ${value}`)
}
export const argWasnt = (name: string, expected: string, value: unknown): never => {
    return wasnt("Argument", name, expected, value)
}
export const returnWasnt = (name: string, expected: string, value: unknown): never => {
    return wasnt("Value returned by", name, expected, value)
}
export const checkReverse = (value: any) => isBool(value) || argWasnt("reverse", "a boolean", value)
export const mustBePos = (name: string) => (value: any) =>
    isPos(value) || argWasnt(name, "positive", value)
export const mustBeInt = (name: string) => (value: any) =>
    isInt(value) || argWasnt(name, "an integer", value)
export const mustNotBeNullish = (name: string) => (value: any) =>
    value != null || argWasnt(name, "not null or undefined", value)
export const mustNotReturnNullish = (name: string) => (value: any) =>
    value != null || returnWasnt(name, "not null or undefined", value)
export const mustReturnPair = (name: string) => (value: any) =>
    (Array.isArray(value) && value.length === 2) || returnWasnt(name, "an array of length 2", value)
export const checkSize = mustBePos("size")
export const checkCount = mustBeInt("count")
export const checkIndex = mustBeInt("index")
export const mustBeFunc = (name: string) => (value: any) =>
    typeof value === "function" || argWasnt(name, "a function", value)
export const checkHandler = mustBeFunc("handler")
export const checkReducer = mustBeFunc("reducer")
export const checkPredicate = mustBeFunc("predicate")
export const checkProjection = mustBeFunc("projection")
export const checkAction = mustBeFunc("action")
export const parseStage = (value: any) => {
    switch (value) {
        case undefined:
        case "before":
            return Stage.Before
        case "after":
            return Stage.After
        case "both":
            return Stage.Both
        default:
            return argWasnt("stage", "one of 'before', 'after', 'both'", value)
    }
}

export const checkThrows = mustNotBeNullish("throws")
export const checkThrowsReturn = mustNotReturnNullish("throws")
export const checkPairProjectionReturn = mustReturnPair("projection")

export function gotNonIterable(object: object, syncness: "sync" | "async", description: string) {
    return new TypeError(
        `Tried to convert ${getClassName(object)} to an ${syncness === "sync" ? "" : "(async) "}iterable, but ${description}`
    )
}
export function cannotRecurseSync(): Error {
    return new Error("Cannot call 'pull' in a synchronous context when the initializer is running.")
}
