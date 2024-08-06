import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function compute<T>(input: Seq<T>): any {
    return input
        .toArray()
        .map(x => x.reverse())
        .pull()
}

export function sync<T>(this: Iterable<T>): Seq<T> {
    return SeqOperator(this, function* reverse(input) {
        yield* compute(seq(input))
    }) as any
}
export function async<T>(this: AsyncIterable<T>): ASeq<T> {
    return ASeqOperator(this, async function* reverse(input) {
        yield* await compute(aseq(input) as any)
    }) as any
}
