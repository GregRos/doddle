import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import { type ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import { type Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

export function sync<T, Items extends any[]>(
    this: Iterable<T>,
    ...items: Items
): Seq<T | Items[number]> {
    return new syncOperator("append", this, function* (input) {
        yield* seq(input).concat(items)
    })
}
export function async<T, Items extends any[]>(
    this: AsyncIterable<T>,
    ...items: Items
): ASeq<T | Items[number]> {
    return new asyncOperator("append", this, async function* (input) {
        yield* aseq(input).concat(items)
    })
}