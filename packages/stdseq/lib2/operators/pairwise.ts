import { seq } from "../wrappers/seq.ctor"
import { type Seq } from "../wrappers/seq.class"
import { aseq } from "../wrappers/aseq.ctor"
import { type ASeq } from "../wrappers/aseq.class"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { getMostlyOptionalTuple } from "../type-functions/get-optional-tuple"

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
