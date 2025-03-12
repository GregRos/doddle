import {
    getClassName,
    getValueDesc,
    isAnyIterable,
    isArray,
    isArrayLike,
    isBool,
    isDoddle,
    isError,
    isFunction,
    isInt,
    isIterable,
    isNatOrInfinity,
    isNextable,
    isPair,
    isPosInt,
    isReadableStream,
    isStage,
    isThenable
} from "../utils.js"

export class DoddleError extends Error {
    constructor(message: Text) {
        super(splat(!Array.isArray(message) ? [message] : message))
    }
}

export function cannotRecurseSync() {
    return new DoddleError(
        `Tried to call 'Doddle.pull' recursively in a sync context, which would not terminate.`
    )
}
/*
Sample error messages:
> Doddle: Argument 'predicate' of oprator 'Seq.filter' must be a function,
> but got 'true'.

> Doddle: Optional argument 'projection' of operator 'Seq.window' must be a function,
> but got 1.

> Doddle: Function argument 'predicate' to operator 'Seq.filter' must return
> true or false, but got 1.

> Doddle: {conversion|operator} 'X' must be called with  {A-B|A} arguments, but got Z.

> Doddle: Input of conversion 'aseq' must be an async iterable, iterable, or a function,
> but got "hello world"

> Doddle: Each element of array argument 'others' to operator 'Seq.zip' must be an
> (async) iterable or function, but got "hello world" at index 1.

> OVERALL
> ${subject} must ${verb} ${expectation}, but got ${value} ${suffix}

subject.must
# Subject
- ${descriptor} '${name}' ${context}

# Descriptors
- Argument
- Function argument


# context
- of operator '${operator}'
-
*/
const wFunction = "function"
const wInteger = "integer"
const wArgument = "argument"
const wReturn = "return"
const wIterable = "iterable"
const wAsync = "(async)"
const wIterator = "iterator"
const wConversion = "conversion"
const wButGot = "but got"
const wBe = "be"
const wCalledWith = "called with"
const wArguments = "arguments"
const wDoddle = "doddle"
const wInvoker = "invoker"
const getButGot = (value: any) => {
    return [wButGot, getValueDesc(value)]
}

export const getSubject = (thing: Text, context: Text, verb: Text) => {
    return [thing, "of", context, "must", verb]
}
export function checkNumberArgs(context: string) {
    return (min: number, max: number = min) => {
        return (args: any[]) => {
            if (args.length < min || args.length > max) {
                throw new DoddleError([
                    getSubject(wCalledWith, [context], wBe),
                    min === max ? min : [min, "to", max],
                    wArguments,
                    getButGot(args.length)
                ])
            }
        }
    }
}
type Expectation = (start: Text) => (x: any) => any
const expectation = (expectation: Text, check: (x: any) => boolean) => {
    return (start: Text) => (x: any) => {
        if (!check(x)) {
            const msg = [start, expectation, getButGot(x)]
            throw new DoddleError(msg)
        }
        return x
    }
}
const expectInt = expectation(`a ${wInteger}`, isInt)
const expectString = expectation("a string", x => typeof x === "string")
const expectIntOrInfinity = expectation(
    `an ${wInteger} or Infinity`,
    x => isInt(x) || x === Infinity
)
const expectObject = expectation("an object", x => x !== null && typeof x === "object")
const expectNatOrInfinity = expectation(`a non-negative ${wInteger} or Infinity`, isNatOrInfinity)
const expectPosInt = expectation(`a positive ${wInteger}`, isPosInt)
const expectOutType = expectation(
    `'item', 'array', 'seq', or undefined`,
    x => x === "item" || x === "array" || x === "seq" || x === undefined
)

const expectBool = expectation("true or false", isBool)
const expectError = expectation("an error", isError)
const expectFunc = expectation(`a ${wFunction}`, isFunction)
const expectPair = expectation("an array of length 2", isPair)
const expectPropertyKey = expectation("a string, number, or symbol", x => {
    return typeof x === "string" || typeof x === "number" || typeof x === "symbol"
})
const expectStage = expectation("'before', 'after', 'both', or undefined", isStage)
const anOrStructure = (a: Text, b: Text) => ["an", a, "or", b] as const
const expectSyncInputValue = expectation(
    anOrStructure([wIterable, wIterator, wDoddle].join(", "), wFunction),
    x => isIterable(x) || isFunction(x) || isDoddle(x) || isNextable(x) || isArrayLike(x)
)
const expectAsyncInputValue = expectation(
    anOrStructure([[wAsync, wIterable, wIterator], wDoddle].join(", "), wFunction),
    x =>
        isAnyIterable(x) ||
        isFunction(x) ||
        isDoddle(x) ||
        isNextable(x) ||
        isReadableStream(x) ||
        isArrayLike(x)
)
const iterableOrIterator = anOrStructure(wIterable, wIterator)
const expectSyncIterableOrIterator = expectation(
    anOrStructure(wIterable, wIterator),
    x => isIterable(x) || isNextable(x) || isDoddle(x) || isArrayLike(x)
)
const expectAsyncIterableOrIterator = expectation(
    anOrStructure([wAsync, wIterable], wIterator),
    x => isAnyIterable(x) || isNextable(x) || isDoddle(x) || isReadableStream(x) || isArrayLike(x)
)
const checkFunctionReturn = (
    thing: Text,
    context: Text,
    expectReturn: Expectation,
    allowAsync: boolean
) => {
    return (f: (...args: any[]) => any) => {
        expectFunc(getSubject(thing, context, wBe))(f)
        return (...args: any[]) => {
            const result = f(...args)
            const resultChecker = expectReturn(getSubject([wFunction, thing], context, wReturn))
            if (isThenable(result) && allowAsync) {
                return result.then(x => {
                    if (isDoddle(x)) {
                        return x.map(resultChecker)
                    }
                    return resultChecker(x)
                })
            }
            if (isDoddle(result)) {
                return result.map(resultChecker)
            }

            return resultChecker(result)
        }
    }
}

export const forOperator = (operator: string) => {
    const context = ["operator", `'${operator}'`]
    function getArgThing(name: string) {
        return [wArgument, `'${name}'`]
    }
    const allowAsync = ["a", "A"].includes(operator[0])
    function getArgSubject(name: string) {
        return getSubject(getArgThing(name), context, wBe)
    }
    function getPropSubject(argName: string, propName: string) {
        return getSubject(
            ["property", `'${propName}'`],
            [wArgument, `'${argName}`, "to", ...context],
            wBe
        )
    }
    function checkValue<K extends string>(name: K, exp: Expectation) {
        return [name, exp(getArgSubject(name))] as const
    }
    function checkPropValue<K extends string>(arg: K, exp: Expectation) {
        return [
            arg,
            (prop: string, x: any) => {
                return exp(getPropSubject(arg, prop))(x)
            }
        ] as const
    }

    function checkFuncReturn<K extends string>(name: K, exp: Expectation) {
        return [name, checkFunctionReturn(getArgThing(name), context, exp, allowAsync)] as const
    }

    const simpleEntries = [
        checkValue("size", expectPosInt),
        checkValue("start", expectInt),
        checkValue("times", expectNatOrInfinity),
        checkValue("end", expectInt),
        checkValue("index", expectInt),
        checkValue("count", expectIntOrInfinity),
        checkValue("projection", expectFunc),
        checkValue("action", expectFunc),
        checkValue("handler", expectFunc),
        checkValue("separator", expectString),
        checkValue("outType", expectOutType),
        checkValue("reverse", expectBool),
        checkValue("reducer", expectFunc),
        checkValue("stage", expectStage),
        checkValue("skipCount", expectPosInt),
        checkValue("keyProjection", expectFunc),
        checkValue("propName", expectPropertyKey),
        checkValue("cases", expectObject),
        checkFuncReturn("kvpProjection", expectPair),
        checkFuncReturn("predicate", expectBool),
        checkFuncReturn("thrower", expectError),
        checkFuncReturn("propProjection", expectPropertyKey)
    ] as const
    type SimpleEntries = typeof simpleEntries
    type SimpleCheckersObject = {
        [K in keyof SimpleEntries & number as SimpleEntries[K][0]]: <T>(input: T) => T
    }
    const propEntries = [
        checkPropValue("cases_key", expectPropertyKey),
        checkPropValue("cases_value", expectFunc)
    ] as const
    type PropEntries = typeof propEntries
    type PropertyCheckersObject = {
        [K in keyof PropEntries & number as PropEntries[K][0]]: <T>(
            prop: PropertyKey,
            value: T
        ) => T
    }
    return Object.fromEntries([...simpleEntries, ...propEntries]) as SimpleCheckersObject &
        PropertyCheckersObject
}

export type OperatorMessages = ReturnType<typeof forOperator>
const wInput = "input"
const wSeq = "seq"
const wAseq = "aseq"
export const checkSeqInputValue = <T>(input: T) => {
    const context = [wConversion, wSeq]
    expectSyncInputValue(getSubject(wInput, context, wBe))(input)
    if (isFunction(input)) {
        return checkFunctionReturn(
            wInput,
            context,
            expectSyncIterableOrIterator,
            false
        )(input as any) as T
    }
    return input
}

export const checkASeqInputValue = <T>(input: T) => {
    const context = [wConversion, wAseq]
    expectAsyncInputValue(getSubject(wInput, context, wBe))(input)
    if (isFunction(input)) {
        return checkFunctionReturn(
            wInput,
            context,
            expectAsyncIterableOrIterator,
            true
        )(input as any) as T
    }
    return input
}

export const gotAsyncIteratorInSyncContext = () => {
    throw new DoddleError([
        getSubject(wInput, [wConversion, wAseq], wBe),
        iterableOrIterator,
        [wButGot, "an async", wIterator]
    ])
}

export type _Text<T> = readonly (TextLeaf | T)[]
export type TextLeaf = string | number | boolean | undefined | null
export type Text = TextLeaf | _Text<_Text<_Text<_Text<_Text<string>>>>>
export function splat(bits: Text): string {
    if (!isArray(bits)) {
        return bits as string
    }
    return bits.flat(5).join(" ")
}

const __checkers = "__checkers"

const LOADED = Symbol("CHECKERS_LOADED")
export function loadCheckers(target: any) {
    if (target[LOADED]) {
        return
    }
    Object.getOwnPropertyNames(target)
        .filter(key => !key.startsWith("_"))
        .map(key => target[key])
        .filter(v => isFunction(v) && !(__checkers in v))
        .forEach(v => {
            Object.defineProperty(v, __checkers, {
                value: forOperator(`${getClassName(target)}.${v.name}`)
            })
        })
    target[LOADED] = true
}

export function chk(input: any): OperatorMessages {
    return input[__checkers]
}
