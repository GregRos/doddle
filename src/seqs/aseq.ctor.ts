import { checkASeqInputValue } from "../errors/error.js"
import { pull, type Doddle, type DoddleAsync } from "../lazy/index.js"
import {
    _xiter,
    isArrayLike,
    isAsyncIterable,
    isInt,
    isIterable,
    isNextable,
    isReadableStream,
    type MaybePromise
} from "../utils.js"
import { ASeqOperator, type ASeq } from "./aseq.class.js"
import { DoddleReadableStreamIterator } from "./readable-stream-aiter.js"

export function aseq<E>(input: readonly E[]): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<Promise<DoddleAsync<E>>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<DoddleAsync<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<Promise<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<Doddle<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<MaybePromise<E>>): ASeq<E>
export function aseq<E>(input: ASeq.Input<E>): ASeq<E>
export function aseq<E>(input: ASeq.Input<E>): any {
    input = checkASeqInputValue(input)
    if (isNextable(input) || isReadableStream(input)) {
        // readable streams are basically iterators
        return aseq(() => input).cache()
    }
    if (isAsyncIterable(input) || isIterable(input)) {
        return aseq(() => input)
    }

    return ASeqOperator(input, async function* aseq(input) {
        const result = typeof input === "function" ? input() : input
        const pulled = await pull(result)

        if (isAsyncIterable(pulled) || isIterable(pulled)) {
            // This should handle the case where ReadableStream is an async iterable
            var iterator = _xiter(pulled)
        } else if (isArrayLike(pulled)) {
            for (const key of Object.keys(pulled)) {
                if (isInt(+key)) {
                    yield pull(pulled[+key])
                }
            }
            return
        } else if (isReadableStream(pulled)) {
            iterator = new DoddleReadableStreamIterator(pulled, false)
        } else if (isNextable(pulled)) {
            iterator = pulled
        } else {
            throw new Error("Should be unreachable")
        }
        for (let item = await iterator.next(); !item.done; item = await iterator.next()) {
            yield pull(item.value)
        }
        await iterator.return?.()
    })
}
