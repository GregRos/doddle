import {
    type ASeqLikeInput,
    type getASeqLikeElementType,
    type getSeqLikeElementType,
    type SeqLikeInput
} from "../f-types/index"
import { fromAsyncInput, fromSyncInput } from "../from/input"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

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
