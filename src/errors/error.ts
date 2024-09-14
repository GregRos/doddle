import {
    getClassName,
    getValueDesc,
    isAnyIterable,
    isArray,
    isArrayLike,
    isBool,
    isError,
    isFunction,
    isInt,
    isIterable,
    isLazy,
    isNatOrInfinity,
    isNextable,
    isPair,
    isPosInt,
    isReadableStream,
    isStage,
    isThenable
} from "../utils.js"

export class Doddle extends Error {
    constructor(message: Text) {
        super(splat(!Array.isArray(message) ? [message] : message))
    }
}

export function cannotRecurseSync() {
    return new Doddle(
        `Tried to call 'Lazy.pull' recursively in a sync context, which would not terminate.`
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
const wLazy = "lazy"
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
                throw new Doddle([
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
            throw new Doddle(msg)
        }
        return x
    }
}
const expectInt = expectation(`a ${wInteger}`, isInt)
const expectIntOrInfinity = expectation(
    `an ${wInteger} or Infinity`,
    x => isInt(x) || x === Infinity
)
const expectNatOrInfinity = expectation(`a non-negative ${wInteger} or Infinity`, isNatOrInfinity)
const expectPosInt = expectation(`a positive ${wInteger}`, isPosInt)
const expectBool = expectation("true or false", isBool)
const expectError = expectation("an error", isError)
const expectFunc = expectation(`a ${wFunction}`, isFunction)
const expectPair = expectation("an array of length 2", isPair)
const expectStage = expectation("'before', 'after', 'both', or undefined", isStage)
const anOrStructure = (a: Text, b: Text) => ["an", a, "or", b] as const
const expectSyncInputValue = expectation(
    anOrStructure([wIterable, wIterator, wLazy].join(", "), wFunction),
    x => isIterable(x) || isFunction(x) || isLazy(x) || isNextable(x) || isArrayLike(x)
)
const expectAsyncInputValue = expectation(
    anOrStructure([[wAsync, wIterable, wIterator], wLazy].join(", "), wFunction),
    x =>
        isAnyIterable(x) ||
        isFunction(x) ||
        isLazy(x) ||
        isNextable(x) ||
        isReadableStream(x) ||
        isArrayLike(x)
)
const iterableOrIterator = anOrStructure(wIterable, wIterator)
const expectSyncIterableOrIterator = expectation(
    anOrStructure(wIterable, wIterator),
    x => isIterable(x) || isNextable(x) || isLazy(x) || isArrayLike(x)
)
const expectAsyncIterableOrIterator = expectation(
    anOrStructure([wAsync, wIterable], wIterator),
    x => isAnyIterable(x) || isNextable(x) || isLazy(x) || isReadableStream(x) || isArrayLike(x)
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
                    if (isLazy(x)) {
                        return x.map(resultChecker)
                    }
                    return resultChecker(x)
                })
            }
            if (isLazy(result)) {
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

    const entries = [
        checkValue("size", expectPosInt),
        checkValue("start", expectInt),
        checkValue("times", expectNatOrInfinity),
        checkValue("end", expectInt),
        checkValue("index", expectInt),
        checkValue("count", expectIntOrInfinity),
        checkValue("projection", expectFunc),
        checkValue("action", expectFunc),
        checkValue("handler", expectFunc),
        checkValue("reverse", expectBool),
        checkValue("reducer", expectFunc),
        checkValue("stage", expectStage),
        checkValue("keyProjection", expectFunc),
        checkFuncReturn("kvpProjection", expectPair),
        checkFuncReturn("predicate", expectBool),
        checkFuncReturn("thrower", expectError)
    ] as const
    type Entries = typeof entries
    type ResultingObjectType = {
        [K in keyof Entries & number as Entries[K][0]]: <T>(input: T) => T
    }
    return Object.fromEntries(entries) as ResultingObjectType
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
    throw new Doddle([
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
