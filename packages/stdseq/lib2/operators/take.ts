import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import _takeWhile from "./take-while"
import { aseq, seq } from "../ctors"
const _take = {
    name: "take",
    sync<T, Ellipsis = T>(this: Iterable<T>, count: number, ellipsis?: Ellipsis) {
        return syncFromOperator(_take, this, function* (input) {
            yield* seq(input).takeWhile((_, index) => index < count, ellipsis)
        })
    },
    async<T, Ellipsis = T>(this: AsyncIterable<T>, count: number, ellipsis?: Ellipsis) {
        return asyncFromOperator(_take, this, async function* (input) {
            yield* aseq(input).takeWhile((_, index) => index < count, ellipsis)
        })
    }
}
export default _take
