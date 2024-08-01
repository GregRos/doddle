import { lazyFromOperator } from "../from/operator"
import type { Lazy, LazyAsync } from "../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    return lazyFromOperator("every", this, input => {
        return !seq(input)
            .some((x, i) => !predicate(x, i))
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): LazyAsync<boolean> {
    return lazyFromOperator("every", this, async input => {
        return aseq(input)
            .some(async (x, i) => !(await predicate(x, i)))
            .map(x => !x)
            .pull()
    })
}
