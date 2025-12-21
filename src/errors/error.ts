import {
    getClassName,
    getValueDesc,
    isArrayLike,
    isAsyncIterable,
    isBool,
    isDoddle,
    isFunction,
    isInt,
    isIterable,
    isNextable,
    isPair,
    isPosInt,
    isReadableStream,
    isThenable,
    orderedStages
} from "../utils.js"

export class DoddleError extends Error {
    constructor(message: Text) {
        super((!Array.isArray(message) ? [message] : message).flat(5).join(" "))
    }
}
/*
Doddle: While calling 'Seq.filter', argument 'predicate' must be a function,
but got 'true'.
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
const getButGot = (value: any) => {
    return ["but got", getValueDesc(value)]
}

export const getSubject = (thing: Text, context: Text, verb: Text) => {
    return [thing, "of", context, "must", verb]
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
const expectInt = expectation(`a integer`, isInt)
const expectString = expectation(`a string`, x => typeof x === "string")
const expectIntOrInfinity = expectation(`an integer or Infinity`, x => isInt(x) || x === Infinity)
const expectPosInt = expectation(`a positive integer`, isPosInt)

const expectBool = expectation(`true or false`, isBool)
const expectError = expectation(`an error`, x => x instanceof Error)
const expectFunc = expectation(`a function`, isFunction)
const expectPair = expectation(`an array of length 2`, isPair)

const expectStage = expectation(
    "'before', 'after', 'both', or undefined",
    stage => orderedStages.indexOf(stage) > -1
)
const anOrStructure = (a: Text, b: Text) => ["an", a, "or", b] as const
const expectSyncInputValue = expectation(
    anOrStructure(["iterable", "iterator", "doddle"], "a function"),
    x => isIterable(x) || isFunction(x) || isDoddle(x) || isNextable(x) || isArrayLike(x)
)
const expectAsyncInputValue = expectation(
    anOrStructure(["(async) iterable", "iterator", "doddle"].join(", "), "a function"),
    x =>
        isIterable(x) ||
        isAsyncIterable(x) ||
        isFunction(x) ||
        isDoddle(x) ||
        isNextable(x) ||
        isReadableStream(x) ||
        isArrayLike(x)
)
const iterableOrIterator = anOrStructure("iterable", "iterator")
const expectSyncIterableOrIterator = expectation(
    anOrStructure("iterable", "iterator"),
    x => isIterable(x) || isNextable(x) || isDoddle(x) || isArrayLike(x)
)
const expectAsyncIterableOrIterator = expectation(
    anOrStructure(["(async)", "iterable"], "iterator"),
    x =>
        isIterable(x) ||
        isAsyncIterable(x) ||
        isNextable(x) ||
        isDoddle(x) ||
        isReadableStream(x) ||
        isArrayLike(x)
)
const checkFunctionReturn = (
    thing: Text,
    context: Text,
    expectReturn: Expectation,
    allowAsync: boolean
) => {
    return (f: (...args: any[]) => any) => {
        expectFunc(getSubject(thing, context, "be"))(f)
        return (...args: any[]) => {
            const result = f(...args)
            const resultChecker = expectReturn(getSubject(["function", thing], context, "return"))
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
        return ["argument", `'${name}'`]
    }
    const allowAsync = ["a", "A"].includes(operator[0])
    function getArgSubject(name: string) {
        return getSubject(getArgThing(name), context, "be")
    }

    function checkValue<K extends string>(name: K, exp: Expectation) {
        return [name, exp(getArgSubject(name))] as const
    }

    function checkFuncReturn<K extends string>(name: K, exp: Expectation) {
        return [name, checkFunctionReturn(getArgThing(name), context, exp, allowAsync)] as const
    }

    const simpleEntries = [
        checkValue("size", expectPosInt),
        checkValue("start", expectInt),
        checkValue("end", expectIntOrInfinity),
        checkValue("index", expectInt),
        checkValue("count", expectIntOrInfinity),
        checkValue("projection", expectFunc),
        checkValue("action", expectFunc),
        checkValue("handler", expectFunc),
        checkValue("separator", expectString),
        checkValue("descending", expectBool),
        checkValue("reducer", expectFunc),
        checkValue("stage", expectStage),
        checkValue("skipCount", expectPosInt),
        checkValue("keyProjection", expectFunc),
        checkFuncReturn("kvpProjection", expectPair),
        checkFuncReturn("predicate", expectBool),
        checkFuncReturn("thrower", expectError),
        checkValue("ms", expectInt)
    ] as const

    return Object.fromEntries(simpleEntries) as {
        [X in (typeof simpleEntries)[number] as X[0]]: X[1]
    }
}

export type OperatorMessages = ReturnType<typeof forOperator>
const wInput = "input"
const wSeq = "'seq'"
const wAseq = "'aseq'"
export const checkSeqInputValue = <T>(input: T) => {
    const context = ["conversion", wSeq]
    expectSyncInputValue(getSubject(wInput, context, "be"))(input)
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
    const context = ["conversion", wAseq]
    expectAsyncInputValue(getSubject(wInput, context, "be"))(input)
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
        getSubject(wInput, [wAseq], "be"),
        iterableOrIterator,
        ["but got", "an async", "iterator"]
    ])
}

export type _Text<T> = readonly (TextLeaf | T)[]
export type TextLeaf = string | number | boolean | undefined | null
export type Text = TextLeaf | _Text<_Text<_Text<_Text<_Text<string>>>>>

const __checkers = "__checkers"

const LOADED = Symbol(__checkers)
export function loadCheckers(target: any) {
    if (LOADED in target) {
        return target
    }
    for (const key of Object.getOwnPropertyNames(target).filter(x => !x.startsWith("_")) as any[]) {
        const v = target[key]
        if (isFunction(v) && !(v as any)[__checkers]) {
            Object.defineProperty(v, __checkers, {
                value: forOperator(`${getClassName(target)}.${key}`)
            })
        }
    }

    return Object.defineProperty(target, LOADED, {})
}

export function chk(input: any): OperatorMessages {
    return input[__checkers]
}

export const invalidRecursionError = (parentType: string) => {
    return `Child iterable called its own ${parentType} during iteration, which is illegal.`
}

export const reduceOnEmptyError = "Cannot reduce empty sequence with no initial value"
