import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { seq } from "../seq"
import { aseq } from "../aseq"
import { mustBeBoolean, mustBeFunction, mustReturnTuple } from "../errors/error"
const mustReturnPair = mustReturnTuple(2)
export function sync<T, K, V>(this: Iterable<T>, projection: Iteratee<T, [K, V]>) {
    mustBeFunction("selector", projection)
    return lazyFromOperator("toMap", this, input => {
        const result = seq(input)
            .map(projection)
            .each(x => {
                mustReturnPair("projection", x)
            })
            .toArray()
            .pull()
        return new Map(result)
    })
}
export function async<T, K, V>(this: AsyncIterable<T>, projection: AsyncIteratee<T, [K, V]>) {
    mustBeFunction("projection", projection)
    return lazyFromOperator("toMap", this, async input => {
        const result = await aseq(input)
            .map(projection)
            .each(x => {
                mustReturnPair("projection", x)
            })
            .toArray()
            .pull()
        return new Map(result)
    })
}
