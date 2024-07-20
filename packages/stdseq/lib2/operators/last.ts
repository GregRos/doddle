import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _last = {
    name: "last",
    sync<T, Alt = undefined>(this: Iterable<T>, alt?: Alt) {
        return lazyFromOperator(_last, this, input => {
            let last: T | Alt = alt as Alt
            for (const element of input) {
                last = element
            }
            return last
        })
    },
    async<T, Alt = undefined>(this: AsyncIterable<T>, alt?: Alt) {
        return lazyFromOperator(_last, this, async input => {
            let last: T | Alt = alt as Alt
            for await (const element of input) {
                last = element
            }
            return last
        })
    }
}

export default _last
