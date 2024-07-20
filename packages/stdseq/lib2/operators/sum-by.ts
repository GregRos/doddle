import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import _reduce from "./reduce"
import type { Lazy, LazyAsync } from "stdlazy/lib"
import { aseq, seq } from "../ctors"

const _sumBy = {
    name: "sumBy",
    sync<T>(this: Iterable<T>, projection: Iteratee<T, number>) {
        return lazyFromOperator(_sumBy, this, input => {
            return seq(input)
                .map(projection)
                .reduce((acc, element) => acc + element, 0)
                .pull()
        })
    },
    async<T>(this: AsyncIterable<T>, projection: AsyncIteratee<T, number>): LazyAsync<number> {
        return lazyFromOperator(_sumBy, this, async input => {
            return await aseq(input)
                .map(projection)
                .reduce((acc, element) => acc + element, 0)
                .pull()
        })
    }
}

export default _sumBy
