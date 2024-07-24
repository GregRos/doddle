import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

export function sync<T, Alt = undefined>(this: Iterable<T>, alt?: Alt) {
    return lazyFromOperator("first", this, input => {
        for (const element of input) {
            return element
        }
        return alt
    })
}
export function async<T, Alt = undefined>(this: AsyncIterable<T>, alt?: Alt) {
    return lazyFromOperator("first", this, async input => {
        for await (const element of input) {
            return element
        }
        return alt
    })
}
