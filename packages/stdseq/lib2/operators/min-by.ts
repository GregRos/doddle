import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { seq } from "../wrappers/seq.ctor"
import { aseq } from "../wrappers/aseq.ctor"
import { mustReturnArray, mustReturnComparable } from "../errors/error"

export function sync<T, K>(this: Iterable<T>, iteratee: Iteratee<T, K>) {
    return lazyFromOperator("minBy", this, input => {
        return seq(input)
            .map((element, index) => {
                return {
                    key: mustReturnComparable("iteratee", iteratee(element, index)),
                    value: element
                }
            })
            .reduce((min, value) => {
                return min.key < value.key ? min : value
            })
            .pull()
    })
}
export function async<T, K>(this: AsyncIterable<T>, iteratee: AsyncIteratee<T, K>) {
    return lazyFromOperator("minBy", this, async input => {
        return await aseq(input)
            .map(async (element, index) => {
                return {
                    key: mustReturnComparable("iteratee", await iteratee(element, index)),
                    value: element
                }
            })
            .reduce((min, value) => {
                return min.key < value.key ? min : value
            })
            .pull()
    })
}
