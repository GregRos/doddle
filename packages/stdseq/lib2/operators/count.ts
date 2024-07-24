import { lazyFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type AsyncPredicate, type Predicate } from "../f-types/index"
import { lazy } from "stdlazy/lib"
import { seq } from "../seq"
import { aseq } from "../aseq"
import { mustBeFunction } from "../errors/error"

export function sync<T>(this: Iterable<T>, predicate: Predicate<T>) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("count", this, input => {
        return seq(input)
            .filter(predicate)
            .reduce(acc => acc + 1, 0)
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("count", this, async input => {
        return await aseq(input)
            .filter(predicate)
            .reduce(acc => acc + 1, 0)
            .pull()
    })
}
