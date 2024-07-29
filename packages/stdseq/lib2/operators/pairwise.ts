import { asyncFromOperator, syncFromOperator } from "../from/operator"
import { type ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import { seq } from "../seq/seq.ctor"

export function sync<T, S>(this: Iterable<T>, projection: (...args: [T?, T?]) => S) {
    return syncFromOperator("pairwise", this, function* (input) {
        yield* seq(input).window(2, projection)
    })
}
export function async<T, S>(this: AsyncIterable<T>, projection: (...args: [T?, T?]) => S): ASeq<S> {
    return asyncFromOperator("pairwise", this, async function* (input) {
        yield* aseq(input).window(2, projection)
    })
}
