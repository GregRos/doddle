import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type AsyncPredicate, type Predicate } from "../f-types/index"
import { seq } from "../wrappers/seq.ctor"
import { aseq } from "../wrappers/aseq.ctor"
import { mustBeFunction } from "../errors/error"

export function sync<T, Alt = undefined>(this: Iterable<T>, predicate: Predicate<T>, alt?: Alt) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("findLast", this, input => {
        return seq(input).filter(predicate).last(alt).pull()
    })
}
export function async<T, Alt = T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>, alt?: Alt) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("findLast", this, async input => {
        return await aseq(input).filter(predicate).last(alt).pull()
    })
}
