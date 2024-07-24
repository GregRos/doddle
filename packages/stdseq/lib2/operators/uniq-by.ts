import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { mustBeFunction } from "../errors/error"

export function sync<T>(this: Iterable<T>, projection: Iteratee<T, any>) {
    mustBeFunction("projection", projection)
    return lazyFromOperator("uniqBy", this, function* (input) {
        const seen = new Set()
        let index = 0
        for (const element of input) {
            const key = projection(element, index++)
            if (!seen.has(key)) {
                seen.add(key)
                yield element
            }
        }
    })
}
export function async<T>(this: AsyncIterable<T>, projection: AsyncIteratee<T, any>) {
    mustBeFunction("projection", projection)
    return lazyFromOperator("uniqBy", this, async function* (input) {
        const seen = new Set()
        let index = 0
        for await (const element of input) {
            const key = await projection(element, index++)
            if (!seen.has(key)) {
                seen.add(key)
                yield element
            }
        }
    })
}
