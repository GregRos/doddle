import { asyncFromOperator, syncFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>) {
    return syncFromOperator("uniq", this, function* (input) {
        yield* seq(input).uniqBy(x => x)
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return asyncFromOperator("uniq", this, async function* (input) {
        yield* aseq(input).uniqBy(x => x)
    })
}
