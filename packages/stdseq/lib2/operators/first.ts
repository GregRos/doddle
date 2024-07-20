import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { unset } from "../consts"

const _first = {
    name: "first",
    sync<T, Alt = undefined>(this: Iterable<T>, alt?: Alt) {
        return lazyFromOperator(_first, this, input => {
            for (const element of input) {
                return element
            }
            return alt
        })
    },
    async<T, Alt = undefined>(this: AsyncIterable<T>, alt?: Alt) {
        return lazyFromOperator(_first, this, async input => {
            for await (const element of input) {
                return element
            }
            return alt
        })
    }
}

export default _first
