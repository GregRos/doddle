import { checkProjection } from "../../errors/error.js"
import type { LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function generic<T>(input: Seq<T>, projection: Seq.Iteratee<T, number>) {
    checkProjection(projection)
    return lazyFromOperator(input, function sumBy(input) {
        return input
            .map(projection)
            .reduce((acc, element) => acc + element, 0)
            .pull()
    })
}
export function sync<T>(this: Iterable<T>, projection: Seq.Iteratee<T, number>) {
    return generic(seq(this), projection)
}
export function async<T>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, number>
): LazyAsync<number> {
    return generic(aseq(this) as any, projection as any) as any
}
