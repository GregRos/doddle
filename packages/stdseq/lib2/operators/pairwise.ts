import { seq, type Seq } from "../seq"
import { aseq, type ASeq } from "../aseq"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { getOptionalTuple } from "../type-functions/get-optional-tuple"

export function sync<T, S, AllowSmaller extends boolean = false>(
    this: Iterable<T>,
    projection: (...args: AllowSmaller extends false ? [T, T] : [T?, T?]) => S,
    allowSmaller?: AllowSmaller
): Seq<S> {
    return syncFromOperator("pairwise", this, function* (input) {
        yield* seq(input).window(2, projection, allowSmaller)
    })
}
export function async<T, S, AllowSmaller extends boolean = false>(
    this: AsyncIterable<T>,
    projection: (...args: AllowSmaller extends false ? [T, T] : [T?, T?]) => S,
    allowSmaller?: AllowSmaller
): ASeq<S> {
    return asyncFromOperator("pairwise", this, async function* (input) {
        yield* aseq(input).window(2, projection, allowSmaller)
    })
}
