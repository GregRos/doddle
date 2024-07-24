import { seq } from "../seq"
import { asyncFromOperator, lazyFromOperator, syncFromOperator } from "../from/operator"
import { mustBeInteger, mustBeNatural } from "../errors/error"
import { aseq, type ASeq } from "../aseq"

export function sync<T, S = T>(this: Iterable<T>, ...items: S[]) {
    return syncFromOperator("append", this, function* (input) {
        yield* seq(input).concat(items)
    })
}
export function async<T, S>(this: AsyncIterable<T>, ...items: S[]): ASeq<T | S> {
    return asyncFromOperator("append", this, async function* (input) {
        yield* aseq(input).concat(items)
    })
}
