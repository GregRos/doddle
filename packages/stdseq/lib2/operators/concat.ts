import { asyncFromOperator, syncFromOperator } from "../from/operator"
import {
    Iteratee,
    AsyncIteratee,
    type SeqLikeInput,
    type ASeqLikeInput,
    type getSeqLikeElementType,
    type getASeqLikeElementType
} from "../f-types/index"
import { mustBeAsyncIterable, mustBeIterable } from "../errors/error"
import { fromAsyncInput, fromSyncInput } from "../from/input"
import type { Seq } from "../wrappers/seq.class"
import type { ASeq } from "../wrappers/aseq.class"

export function sync<T, Seqs extends SeqLikeInput<any>[]>(
    this: Iterable<T>,
    ..._iterables: Seqs
): Seq<T | getSeqLikeElementType<Seqs[number]>> {
    const iterables = _iterables.map(fromSyncInput)
    return syncFromOperator("concat", this, function* (input) {
        yield* input
        for (const iterable of iterables) {
            yield* iterable
        }
    })
}
export function async<T, ASeqs extends ASeqLikeInput<any>[]>(
    this: AsyncIterable<T>,
    ..._otherInputs: ASeqs
): ASeq<T | getASeqLikeElementType<ASeqs[number]>> {
    const inputs = _otherInputs.map(fromAsyncInput)
    return asyncFromOperator("concat", this, async function* (input) {
        for await (const element of input) {
            yield element
        }
        for (const iterable of inputs) {
            for await (const element of iterable) {
                yield element
            }
        }
    })
}
