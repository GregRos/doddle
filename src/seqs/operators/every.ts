import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    return lazyFromOperator(this, function every(input) {
        return !seq(input)
            .some((x, i) => !predicate(x, i))
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): LazyAsync<boolean> {
    return lazyFromOperator(this, async function every(input) {
        return aseq(input)
            .some(async (x, i) => !(await predicate(x, i)))
            .map(x => !x)
            .pull()
    })
}
