import { seq, aseq } from "../ctors"
import { asyncFromOperator, syncFromOperator } from "../from/operator"

const _pairwise = {
    name: "pairwise",
    sync<T>(this: Iterable<T>): Iterable<[T, T]> {
        return syncFromOperator(_pairwise, this, function* (input) {
            yield* seq(input).windowed(2)
        })
    },
    async<T>(this: AsyncIterable<T>): AsyncIterable<[T, T]> {
        return asyncFromOperator(_pairwise, this, async function* (input) {
            yield* aseq(input).windowed(2)
        })
    }
}

export default _pairwise
