import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { seq } from "../seq"
import { aseq } from "../aseq"

export function sync<T>(this: Iterable<T>, value: T) {
    return lazyFromOperator("includes", this, input => {
        return seq(input)
            .some(element => element === value)
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>, value: T) {
    return lazyFromOperator("includes", this, async input => {
        return aseq(input)
            .some(element => element === value)
            .pull()
    })
}
