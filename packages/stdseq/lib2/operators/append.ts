import { seq } from "../wrappers/seq.ctor"
import { type Seq } from "../wrappers/seq.class"
import { asyncFromOperator, lazyFromOperator, syncFromOperator } from "../from/operator"
import { mustBeInteger, mustBeNatural } from "../errors/error"
import { aseq } from "../wrappers/aseq.ctor"
import { type ASeq } from "../wrappers/aseq.class"

export function sync<T, Items extends any[]>(
    this: Iterable<T>,
    ...items: Items
): Seq<T | Items[number]> {
    return syncFromOperator("append", this, function* (input) {
        yield* seq(input).concat(items)
    })
}
export function async<T, Items extends any[]>(
    this: AsyncIterable<T>,
    ...items: Items
): ASeq<T | Items[number]> {
    return asyncFromOperator("append", this, async function* (input) {
        yield* aseq(input).concat(items)
    })
}
