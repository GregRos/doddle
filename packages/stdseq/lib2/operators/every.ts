import { lazyFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type AsyncPredicate, type Predicate } from "../f-types/index"
import { aseq } from "../aseq"
import { seq } from "../seq"
import { mustBeFunction } from "../errors/error"

export function sync<T>(this: Iterable<T>, predicate: Predicate<T>) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("every", this, async input => {
        return !seq(input).some((element, index) => !predicate(element, index))
    })
}
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("every", this, async input => {
        return !(await aseq(input)
            .some(async (element, index) => !(await predicate(element, index)))
            .pull())
    })
}
