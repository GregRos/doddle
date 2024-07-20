import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _includes = {
    name: "includes",
    sync<T>(this: Iterable<T>, value: T) {
        return lazyFromOperator(_includes, this, input => {
            for (const element of input) {
                if (element === value) {
                    return true
                }
            }
            return false
        })
    },
    async<T>(this: AsyncIterable<T>, value: T) {
        return lazyFromOperator(_includes, this, async input => {
            for await (const element of input) {
                if (element === value) {
                    return true
                }
            }
            return false
        })
    }
}

export default _includes
