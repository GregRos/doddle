import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _find = {
    name: "find",
    sync<T, Alt = T>(this: Iterable<T>, predicate: Iteratee<T, boolean>, alt?: Alt) {
        return lazyFromOperator(_find, this, input => {
            let index = 0
            for (const element of input) {
                if (predicate(element, index++)) {
                    return element
                }
            }
            return alt
        })
    },
    async<T, Alt = T>(this: AsyncIterable<T>, predicate: AsyncIteratee<T, boolean>, alt?: Alt) {
        return lazyFromOperator(_find, this, async input => {
            let index = 0
            for await (const element of input) {
                if (await predicate(element, index++)) {
                    return element
                }
            }
            return alt
        })
    }
}

export default _find
