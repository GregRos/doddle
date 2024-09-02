import { checkASeqInputValue } from "../errors/error.js"
import { pull, type Lazy, type LazyAsync } from "../lazy/index.js"
import { _xiter, isAsyncIterable, isIterable, isNextable, isReadableStream } from "../utils.js"
import { ASeqOperator, type ASeq } from "./aseq.class.js"
import { DoddleReadableStreamIterator } from "./readable-stream-aiter.js"

export function aseq<E>(input: readonly E[]): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<PromiseLike<LazyAsync<E>>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<LazyAsync<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<PromiseLike<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<Lazy<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<E>): ASeq<E>
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
