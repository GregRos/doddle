import {
    defineValueProperty,
    fromEntries,
    getClassName,
    getLength,
    getOwnPropertyNames,
    getValueDesc,
    isAnyIterable,
    isArray,
    isArrayLike,
    isBool,
    isDoddle,
    isError,
    isFunction,
    isInt,
    isIntOrInfinity,
    isIterable,
    isNatOrInfinity,
    isNextable,
    isPair,
    isPosInt,
    isReadableStream,
    isStage,
    isString,
    isThenable,
    splat
} from "../utils.js"
import {
    wAction,
    wAfter,
    wArgument,
    wArguments,
    wArray,
    wAseq,
    wAsync,
    wBe,
    wBefore,
    wBoth,
    wButGot,
    wCalledWith,
    wConversion,
    wCount,
    wDoddle,
    wEnd,
    wError,
    wF,
    wFunction,
    wHandler,
    wIndex,
    wInf,
    wInput,
    wInteger,
    wIterable,
    wIterator,
    wKeyProjection,
    wKvpProjection,
    wLength,
    wNegative,
    wpAsync,
    wPositive,
    wPredicate,
    wProjection,
    wReducer,
    wReturn,
    wReverse,
    wSeparator,
    wSeq,
    wSize,
    wSkipCount,
    wStage,
    wStart,
    wString,
    wSync,
    wT,
    wThrower,
    wTimes,
    wUndefined
} from "../words.js"

export class DoddleError extends Error {
    name = "DoddleError"
    constructor(message: Text) {
        super(splat(!isArray(message) ? [message] : message))
    }
}

export function cannotRecurseSync() {
    return new DoddleError(
        `Tried to call 'Doddle.pull' recursively in a ${wSync} context, which would not terminate.`
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

const getButGot = (value: any) => {
    return [wButGot, getValueDesc(value)]
}

export const getSubject = (thing: Text, context: Text, verb: Text) => {
    return [thing, "of", context, "must", verb]
}
export function checkNumberArgs(context: string) {
    return (min: number, max: number = min) => {
        return (args: any[]) => {
            if (getLength(args) < min || getLength(args) > max) {
                throw new DoddleError([
                    getSubject(wCalledWith, [context], wBe),
                    min === max ? min : [min, "to", max],
                    wArguments,
                    getButGot(getLength(args))
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
const expectString = expectation(`a ${wString}`, isString)
const expectIntOrInfinity = expectation(`an ${wInteger} or ${wInf}`, isIntOrInfinity)
const expectNatOrInfinity = expectation(
    `a non-${wNegative} ${wInteger} or ${wInf}`,
    isNatOrInfinity
)
const expectPosInt = expectation(`a ${wPositive} ${wInteger}`, isPosInt)

const expectBool = expectation(`${wT} or ${wF}`, isBool)
const expectError = expectation(`an ${wError}`, isError)
const expectFunc = expectation(`a ${wFunction}`, isFunction)
const expectPair = expectation(`an ${wArray} of ${wLength} 2`, isPair)

const expectStage = expectation(`'${wBefore}', '${wAfter}', '${wBoth}', or ${wUndefined}`, isStage)
const anOrStructure = (a: Text, b: Text) => ["an", a, "or", b] as const
const expectSyncInputValue = expectation(
    anOrStructure([wIterable, wIterator, wDoddle].join(", "), wFunction),
    x => isIterable(x) || isFunction(x) || isDoddle(x) || isNextable(x) || isArrayLike(x)
)
const expectAsyncInputValue = expectation(
    anOrStructure([[wpAsync, wIterable, wIterator], wDoddle].join(", "), wFunction),
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
    anOrStructure([wpAsync, wIterable], wIterator),
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

    function checkValue<K extends string>(name: K, exp: Expectation) {
        return [name, exp(getArgSubject(name))] as const
    }

    function checkFuncReturn<K extends string>(name: K, exp: Expectation) {
        return [name, checkFunctionReturn(getArgThing(name), context, exp, allowAsync)] as const
    }

    const simpleEntries = [
        checkValue(wSize, expectPosInt),
        checkValue(wStart, expectInt),
        checkValue(wTimes, expectNatOrInfinity),
        checkValue(wEnd, expectInt),
        checkValue(wIndex, expectInt),

        checkValue(wCount, expectIntOrInfinity),
        checkValue(wProjection, expectFunc),
        checkValue(wAction, expectFunc),
        checkValue(wHandler, expectFunc),
        checkValue(wSeparator, expectString),
        checkValue(wReverse, expectBool),
        checkValue(wReducer, expectFunc),
        checkValue(wStage, expectStage),
        checkValue(wSkipCount, expectPosInt),
        checkValue(wKeyProjection, expectFunc),
        checkFuncReturn(wKvpProjection, expectPair),
        checkFuncReturn(wPredicate, expectBool),
        checkFuncReturn(wThrower, expectError),
        checkValue("ms", expectInt)
    ] as const

    return fromEntries(simpleEntries) as {
        [X in (typeof simpleEntries)[number] as X[0]]: X[1]
    }
}

export type OperatorMessages = ReturnType<typeof forOperator>

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
        [wButGot, `an ${wAsync}`, wIterator]
    ])
}

export type _Text<T> = readonly (TextLeaf | T)[]
export type TextLeaf = string | number | boolean | undefined | null
export type Text = TextLeaf | _Text<_Text<_Text<_Text<_Text<string>>>>>

const __checkers = "__checkers"

const LOADED = Symbol(__checkers)
export function loadCheckers<X>(t: X) {
    const target = t as any
    if (target[LOADED]) {
        return t
    }
    getOwnPropertyNames(target)
        .filter(key => !key.startsWith("_"))
        .map(key => target[key])
        .filter(v => isFunction(v) && !(__checkers in v))
        .forEach(v => {
            defineValueProperty(v, __checkers, forOperator(`${getClassName(target)}.${v.name}`))
        })
    defineValueProperty(target, LOADED, true)
    return t!
}

export function chk(input: any): OperatorMessages {
    return input[__checkers]
}

export const invalidRecursionError = (parentType: string) => {
    return `Child ${wIterable} called its own ${parentType} during iteration, which is illegal.`
}
