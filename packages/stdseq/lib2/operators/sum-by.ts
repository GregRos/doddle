import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import type { Lazy, LazyAsync } from "stdlazy/lib"
import { seq } from "../seq"
import { aseq } from "../aseq"
import { mustBeFunction } from "../errors/error"

export function sync<T>(this: Iterable<T>, projection: Iteratee<T, number>) {
    mustBeFunction("projection", projection)
    return lazyFromOperator("sumBy", this, input => {
        return seq(input)
            .map(projection)
            .reduce((acc, element) => acc + element, 0)
            .pull()
    })
}
export function async<T>(
    this: AsyncIterable<T>,
    projection: AsyncIteratee<T, number>
): LazyAsync<number> {
    mustBeFunction("projection", projection)
    return lazyFromOperator("sumBy", this, async input => {
        return await aseq(input)
            .map(projection)
            .reduce((acc, element) => acc + element, 0)
            .pull()
    })
}
