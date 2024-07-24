import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { seq } from "../seq"
import { aseq } from "../aseq"

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
