import { mustBeBoolean, mustBeFunction, mustReturnComparable } from "../errors/error"
import { AsyncIteratee } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import { seq } from "../seq/seq.ctor"

export function sync<T, S>(this: Iterable<T>, projection: (element: T) => S, reverse = false) {
    mustBeFunction("projection", projection)
    mustBeBoolean("reverse", reverse)
    return syncFromOperator("orderBy", this, function* (input) {
        yield* seq(input)
            .toArray()
            .map(xs => {
                xs.sort((a, b) => {
                    const aKey = mustReturnComparable("projection", projection(a))
                    const bKey = mustReturnComparable("projection", projection(b))
                    return aKey < bKey ? -1 : aKey > bKey ? 1 : 0
                })
                return reverse ? xs.reverse() : xs
            })
            .pull()
    })
}
export function async<T, S>(
    this: AsyncIterable<T>,
    projection: AsyncIteratee<T, S>,
    reverse = false
) {
    mustBeFunction("projection", projection)
    mustBeBoolean("reverse", reverse)
    return asyncFromOperator("orderBy", this, async function* (input) {
        return aseq(input)
            .map(async (element, index) => {
                return {
                    key: mustReturnComparable("projection", await projection(element, index)),
                    value: element
                }
            })
            .toArray()
            .map(async xs => {
                xs.sort((a, b) => {
                    return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                })
                return reverse ? xs.reverse() : xs
            })
    })
}
