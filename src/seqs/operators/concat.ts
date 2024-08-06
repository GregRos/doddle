import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T, Seqs extends Seq.Input<any>[]>(
    this: Iterable<T>,
    ..._iterables: Seqs
): Seq<T | Seq.ElementOfInput<Seqs[number]>> {
    const iterables = _iterables.map(seq)
    return SeqOperator(this, function* concat(input) {
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
    return new ASeqOperator(this, async function* concat(input) {
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
