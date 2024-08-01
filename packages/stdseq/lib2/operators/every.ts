import { type AsyncPredicate, type Predicate } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import type { Lazy, LazyAsync } from "../lazy"
import { aseq } from "../seq/aseq.ctor"
import { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>, predicate: Predicate<T>): Lazy<boolean> {
    return lazyFromOperator("every", this, input => {
        return !seq(input)
            .some((x, i) => !predicate(x, i))
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>): LazyAsync<boolean> {
    return lazyFromOperator("every", this, async input => {
        return aseq(input)
            .some(async (x, i) => !(await predicate(x, i)))
            .map(x => !x)
            .pull()
    })
}
