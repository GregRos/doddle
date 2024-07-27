import { mustBeFunction } from "../errors/error"
import { AsyncIteratee, Iteratee } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { aseq } from "../seq/aseq.ctor"
import type { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>, projection: Iteratee<T, any>): seq<T> {
    mustBeFunction("projection", projection)
    return syncFromOperator("uniqBy", this, function* (input) {
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
export function async<T>(this: AsyncIterable<T>, projection: AsyncIteratee<T, any>): aseq<T> {
    mustBeFunction("projection", projection)
    return asyncFromOperator("uniqBy", this, async function* (input) {
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
