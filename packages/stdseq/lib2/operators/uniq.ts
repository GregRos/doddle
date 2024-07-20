import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import _uniqBy from "./uniq-by"
import { aseq, seq } from "../ctors"

const _uniq = {
    name: "uniq",
    sync<T>(this: Iterable<T>) {
        return syncFromOperator(_uniq, this, function* (input) {
            yield* seq(input).uniqBy(x => x)
        })
    },
    async<T>(this: AsyncIterable<T>) {
        return asyncFromOperator(_uniq, this, async function* (input) {
            yield* aseq(input).uniqBy(x => x)
        })
    }
}

export default _uniq
