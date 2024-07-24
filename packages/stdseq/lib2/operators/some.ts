import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type AsyncPredicate, type Predicate } from "../f-types/index"
import { seq } from "../seq"
import { aseq } from "../aseq"
import { mustBeFunction } from "../errors/error"

export function sync<T>(this: Iterable<T>, predicate: Predicate<T>) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("some", this, input => {
        const unset = {} as any
        return seq(input).find(predicate, unset) !== unset
    })
}
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("some", this, async input => {
        const unset = {} as any
        return (await aseq(input).find(predicate, unset).pull()) !== unset
    })
}
