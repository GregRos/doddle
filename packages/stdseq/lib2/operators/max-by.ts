import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { Seq } from "../seq"
import { fromSyncInput } from "../from/input"
import { seq } from "../seq"
import { aseq } from "../aseq"
import { mustReturnComparable, mustBeFunction } from "../errors/error"

export function sync<T, R>(this: Iterable<T>, iteratee: Iteratee<T, R>) {
    mustBeFunction("iteratee", iteratee)
    return lazyFromOperator("maxBy", this, input => {
        return seq(input)
            .map((x, i) => {
                return {
                    item: x,
                    key: mustReturnComparable("iteratee", iteratee(x, i))
                }
            })
            .reduce((max, value) => {
                return max.key > value.key ? max : value
            })
            .pull()
    })
}
export function async<T, R>(this: AsyncIterable<T>, iteratee: AsyncIteratee<T, R>) {
    mustBeFunction("iteratee", iteratee)
    return lazyFromOperator("maxBy", this, async input => {
        return aseq(input)
            .map(async (x, i) => {
                return {
                    item: x,
                    key: mustReturnComparable("iteratee", await iteratee(x, i))
                }
            })
            .reduce(async (max, value) => {
                return max.key > value.key ? max : value
            })
            .pull()
    })
}
