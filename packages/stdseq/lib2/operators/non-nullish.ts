import { aseq, type ASeq } from "../aseq"
import { asyncFromOperator, lazyFromOperator, syncFromOperator } from "../from/operator"
import { seq, type Seq } from "../seq"
import { UNSET } from "../special/tokens"

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
