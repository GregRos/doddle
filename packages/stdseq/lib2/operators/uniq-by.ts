import { mustBeFunction } from "../errors/error"
import { type AsyncNoIndexIteratee } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { aseq } from "../seq/aseq.ctor"
import type { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>, projection: AsyncNoIndexIteratee<T, any>): seq<T> {
    mustBeFunction("projection", projection)
    return syncFromOperator("uniqBy", this, function* (input) {
        const seen = new Set()
        for (const element of input) {
            const key = projection(element)
            if (!seen.has(key)) {
                seen.add(key)
                yield element
            }
        }
    })
}
export function async<T>(
    this: AsyncIterable<T>,
    projection: AsyncNoIndexIteratee<T, any>
): aseq<T> {
    mustBeFunction("projection", projection)
    return asyncFromOperator("uniqBy", this, async function* (input) {
        const seen = new Set()
        for await (const element of input) {
            const key = await projection(element)
            if (!seen.has(key)) {
                seen.add(key)
                yield element
            }
        }
    })
}
