import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

export function sync<T>(this: Iterable<T>) {
    return lazyFromOperator("toArray", this, input => {
        return [...input]
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return lazyFromOperator("toArray", this, async input => {
        const result: T[] = []
        for await (const element of input) {
            result.push(element)
        }
        return result
    })
}
