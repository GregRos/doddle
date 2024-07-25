import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { seq } from "../wrappers/seq.ctor"
import { aseq } from "../wrappers/aseq.ctor"

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
