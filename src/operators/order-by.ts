import { mustBeBoolean, mustBeFunction } from "../errors/error"
import { type AsyncNoIndexIteratee, type NoIndexIteratee } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import { seq } from "../seq/seq.ctor"
import { returnKvp } from "../special/utils"

export function sync<T>(
    this: Iterable<T>,
    projection: NoIndexIteratee<T, any>,
    reverse = false
): seq<T> {
    mustBeFunction("projection", projection)
    mustBeBoolean("reverse", reverse)
    return syncFromOperator("orderBy", this, function* (input) {
        yield* seq(input)
            .map(e => returnKvp(e, projection(e), e))
            .toArray()
            .map(xs => {
                xs.sort((a: any, b: any) => {
                    const result = a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                    return reverse ? -result : result
                })
                return xs.map((x: any) => x.value)
            })
            .pull()
    })
}
export function async<T, S>(
    this: AsyncIterable<T>,
    projection: AsyncNoIndexIteratee<T, S>,
    reverse = false
): aseq<T> {
    mustBeFunction("projection", projection)
    mustBeBoolean("reverse", reverse)
    return asyncFromOperator("orderBy", this, async function* (input) {
        yield* await aseq(input)
            .map(e => returnKvp(e, projection(e), e))
            .toArray()
            .map(async xs => {
                xs.sort((a, b) => {
                    const comp = a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                    return reverse ? -comp : comp
                })
                return xs.map(x => x.value)
            })
            .pull()
    })
}
