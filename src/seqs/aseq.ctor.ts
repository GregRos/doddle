import { pull, type Doddle, type DoddleAsync } from "../doddle/index.js"
import { checkASeqInputValue } from "../errors/error.js"
import {
    _xiter,
    isArrayLike,
    isAsyncIterable,
    isFunction,
    isInt,
    isIterable,
    isNextable,
    isReadableStream,
    keys,
    type MaybePromise
} from "../utils.js"
import { ASeqOperator, type ASeq } from "./aseq.class.js"
/**
 * Creates a {@link ASeq} from the sequential input. See examples for usage.
 *
 * @example
 *     // An array
 *     aseq([1, 2, 3])
 *
 *     // A generator function
 *     aseq(function* () {
 *         yield 1
 *         yield 2
 *     })
 *
 *     // An async generator function
 *     aseq(async function* () {
 *         yield 1
 *         yield 2
 *     })
 *
 *     // An array-like object, such as a NodeList:
 *     seq(document.getElementsByTagName("div"))
 *
 *     // A readable stream
 *     const response = await fetch("https://example.com/data")
 *     aseq(response.body!)
 *
 *     // An async function returning a sequence
 *     aseq(async () => [1, 2, 3])
 *
 *     // A Doddle yielding a sequence
 *     aseq(doddle(() => [1, 2, 3]))
 *
 *     // An async Doddle yielding a sequence
 *     aseq(doddle(async () => [1, 2, 3]))
 *
 *     // An iterable
 *     aseq(seq([1, 2, 3]))
 *
 *     // An async iterable
 *     aseq(aseq([1, 2, 3]))
 *
 *     // An async function returning an async iterable
 *     aseq(async () => aseq([1, 2, 3]))
 *
 *     // ⛔ Strings are not allowed here.
 *     seq("hello")
 *
 * @param input The input to create the {@link ASeq} from.
 */
function aseq<E>(input: readonly E[]): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<Promise<DoddleAsync<E>>>): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<DoddleAsync<E>>): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<Promise<E>>): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<Doddle<E>>): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<MaybePromise<E>>): ASeq<E>
function aseq<E>(input: ASeq.Input<E>): ASeq<E>
function aseq<E>(input: ASeq.Input<E>): any {
    function fromFunctionResult(input: ReturnType<ASeq.FunctionInput<MaybePromise<E>>>): ASeq<E> {
        return ASeqOperator(input, async function* aseq(input) {
            const pulled = await pull(input)
            if (isAsyncIterable(pulled) || isIterable(pulled)) {
                var iterator = _xiter(pulled)
            } else if (isArrayLike(pulled)) {
                for (const key of keys(pulled)) {
                    if (isInt(+key)) {
                        yield pull(pulled[+key])
                    }
                }
                return
            } else if (isNextable(pulled)) {
                iterator = pulled
            } else {
                throw new Error()
            }
            for (let item = await iterator.next(); !item.done; item = await iterator.next()) {
                yield pull(item.value)
            }
            await iterator.return?.()
        }) as ASeq<E>
    }
    input = checkASeqInputValue(input)
    if (isNextable(input) || isReadableStream(input)) {
        // readable streams are basically iterators
        return fromFunctionResult(input as any).cache()
    }
    if (isAsyncIterable(input) || isIterable(input)) {
        return aseq(() => input)
    }

    return ASeqOperator(input, async function* aseq(input) {
        const result = isFunction(input) ? await input() : input
        const pulled = await pull(result)
        if (isNextable(pulled) || isReadableStream(pulled)) {
            yield* fromFunctionResult(pulled as any).cache()
        }
        yield* fromFunctionResult(pulled as any)
    })
}

export const ___aseq = aseq
