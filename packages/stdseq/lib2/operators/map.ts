import { syncFromOperator, asyncFromOperator, lazyFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { mustBeFunction } from "../errors/error"
export function sync<T, S>(this: Iterable<T>, projection: Iteratee<T, S>) {
    mustBeFunction("projection", projection)
    return syncFromOperator("map", this, function* (input) {
        let index = 0
        for (const element of input) {
            yield projection(element, index++)
        }
    })
}
export function async<T, S>(this: AsyncIterable<T>, projection: AsyncIteratee<T, S>) {
    mustBeFunction("projection", projection)
    return asyncFromOperator("map", this, async function* (input) {
        let index = 0
        for await (const element of input) {
            yield await projection(element, index++)
        }
    })
}
