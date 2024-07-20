import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _toArray = {
    name: "toArray",
    sync<T>(this: Iterable<T>) {
        return lazyFromOperator(_toArray, this, input => {
            return [...input]
        })
    },
    async<T>(this: AsyncIterable<T>) {
        return lazyFromOperator(_toArray, this, async input => {
            const result: T[] = []
            for await (const element of input) {
                result.push(element)
            }
            return result
        })
    }
}

export default _toArray
