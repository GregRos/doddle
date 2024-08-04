import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

export function sync<T, Seqs extends Seq.Input<any>[]>(
    this: Iterable<T>,
    ..._iterables: Seqs
): Seq<T | Seq.ElementOfInput<Seqs[number]>> {
    const iterables = _iterables.map(seq)
    return new syncOperator("concat", this, function* (input) {
        yield* input
        for (const iterable of iterables) {
            yield* iterable
        }
    }) as any
}
export function async<T, ASeqs extends ASeq.SimpleInput<any>[]>(
    this: AsyncIterable<T>,
    ..._otherInputs: ASeqs
): ASeq<T | ASeq.ElementOfInput<ASeqs[number]>> {
    const inputs = _otherInputs.map(aseq)
    return new asyncOperator("concat", this, async function* (input) {
        for await (const element of input) {
            yield element
        }
        for (const iterable of inputs) {
            for await (const element of iterable) {
                yield element
            }
        }
    }) as any
}
