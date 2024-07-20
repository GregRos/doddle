import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _toSet = {
    name: "toSet",
    sync<T>(this: Iterable<T>) {
        return lazyFromOperator(_toSet, this, input => {
            return new Set(input)
        })
    },
    async<T>(this: AsyncIterable<T>) {
        return lazyFromOperator(_toSet, this, async input => {
            const result = new Set<T>()
            for await (const element of input) {
                result.add(element)
            }
            return result
        })
    }
}

export default _toSet
