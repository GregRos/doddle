import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

export function sync<T, Alt = undefined>(this: Iterable<T>, alt?: Alt) {
    return lazyFromOperator("last", this, input => {
        let last: T | Alt = alt as Alt
        for (const element of input) {
            last = element
        }
        return last
    })
}
export function async<T, Alt = undefined>(this: AsyncIterable<T>, alt?: Alt) {
    return lazyFromOperator("last", this, async input => {
        let last: T | Alt = alt as Alt
        for await (const element of input) {
            last = element
        }
        return last
    })
}
