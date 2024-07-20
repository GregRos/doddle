import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import _skipWhile from "./skip-while"
import { aseq, seq } from "../ctors"

const _skip = {
    name: "skip",
    sync<T, Ellipsis = T>(this: Iterable<T>, count: number, ellipsis?: Ellipsis) {
        return syncFromOperator(_skip, this, function* (input) {
            yield* seq(input).skipWhile((_, index) => index < count, ellipsis)
        })
    },
    async<T, Ellipsis = T>(this: AsyncIterable<T>, count: number, ellipsis?: Ellipsis) {
        return asyncFromOperator(_skip, this, async function* (input) {
            yield* aseq(input).skipWhile(async (_, index) => index < count, ellipsis)
        })
    }
}

export default _skip
