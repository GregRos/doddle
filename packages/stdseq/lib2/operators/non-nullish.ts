import { aseq } from "../wrappers/aseq.ctor"
import { type ASeq } from "../wrappers/aseq.class"
import { asyncFromOperator, lazyFromOperator, syncFromOperator } from "../from/operator"
import { seq } from "../wrappers/seq.ctor"
import { type Seq } from "../wrappers/seq.class"
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
