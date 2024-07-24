import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type AsyncPredicate, type Predicate } from "../f-types/index"
import { aseq } from "../aseq"
import { mustBeFunction } from "../errors/error"
import { seq } from "../seq"

export function sync<T, Alt = T>(this: Iterable<T>, predicate: Predicate<T>, alt?: Alt) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("find", this, input => {
        return seq(input).filter(predicate).first(alt).pull()
    })
}
export function async<T, Alt = T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>, alt?: Alt) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("find", this, async input => {
        return aseq(input).filter(predicate).first(alt).pull()
    })
}
