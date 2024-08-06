import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T, Items extends any[]>(
    this: Iterable<T>,
    ...items: Items
): Seq<T | Items[number]> {
    return SeqOperator(this, function* append(input) {
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
