import type { LazyAsync } from "stdlazy"
import { mustBeFunction } from "../errors/error"
import { AsyncIteratee, Iteratee } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

export function generic<T>(input: Seq<T>, projection: Iteratee<T, number>) {
    mustBeFunction("projection", projection)
    return lazyFromOperator("sumBy", input, input => {
        return input
            .map(projection)
            .reduce((acc, element) => acc + element, 0)
            .pull()
    })
}
export function sync<T>(this: Iterable<T>, projection: Iteratee<T, number>) {
    return generic(seq(this), projection)
}
export function async<T>(
    this: AsyncIterable<T>,
    projection: AsyncIteratee<T, number>
): LazyAsync<number> {
    return generic(aseq(this) as any, projection as any) as any
}
