import { ASeqOperator, type ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import { SeqOperator, type Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

export function sync<T, Items extends any[]>(
    this: Iterable<T>,
    ...items: Items
): Seq<T | Items[number]> {
    return new SeqOperator(this, function* append(input) {
        yield* seq(input).concat(items)
    })
}
export function async<T, Items extends any[]>(
    this: AsyncIterable<T>,
    ...items: Items
): ASeq<T | Items[number]> {
    return new ASeqOperator(this, async function* append(input) {
        yield* aseq(input).concat(items)
    })
}