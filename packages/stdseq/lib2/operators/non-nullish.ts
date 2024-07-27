import { asyncFromOperator, syncFromOperator } from "../from/operator"
import { type ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import { type Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>): Seq<NonNullable<T>> {
    return syncFromOperator("nonNullish", this, function* (input) {
        yield* seq(input).filter(x => x != null)
    })
}

export function async<T>(this: AsyncIterable<T>): ASeq<NonNullable<T>> {
    return asyncFromOperator("nonNullish", this, async function* (input) {
        yield* aseq(input).filter(x => x != null)
    })
}
