import type { Lazy, LazyAsync } from "../../lazy"
import { lazyFromOperator } from "../lazy-operator"
import { aseq } from "../seq/aseq"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq"

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
