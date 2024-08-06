import { mustBeFunction } from "../../errors/error"
import type { LazyAsync } from "../../lazy"
import { lazyFromOperator } from "../lazy-operator"
import { aseq } from "../seq/aseq"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq"

export function generic<T>(input: Seq<T>, projection: Seq.Iteratee<T, number>) {
    mustBeFunction("projection", projection)
    return lazyFromOperator("sumBy", input, input => {
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
