import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _findLast = {
    name: "findLast",
    sync<T, Alt = undefined>(this: Iterable<T>, predicate: Iteratee<T, boolean>, alt?: Alt) {
        return lazyFromOperator(_findLast, this, input => {
            let index = 0
            let last: T | Alt = alt as any
            for (const element of input) {
                if (predicate(element, index++)) {
                    last = element
                }
            }
            return last
        })
    },
    async<T, Alt = T>(this: AsyncIterable<T>, predicate: AsyncIteratee<T, boolean>, alt?: Alt) {
        return lazyFromOperator(_findLast, this, async input => {
            let index = 0
            let last: T | Alt = alt as any
            for await (const element of input) {
                if (await predicate(element, index++)) {
                    last = element
                }
            }
            return last
        })
    }
}

export default _findLast
