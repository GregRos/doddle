import { lazyFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { lazy } from "stdlazy/lib"
import _reduce from "./reduce"
import { aseq, seq } from "../ctors"

const _count = {
    name: "count",
    sync<T>(this: Iterable<T>, predicate: Iteratee<T, boolean>) {
        return lazyFromOperator(_count, this, input => {
            return seq(input)
                .reduce((acc, element, index) => acc + (predicate(element, index) ? 1 : 0), 0)
                .pull()
        })
    },
    async<T>(this: AsyncIterable<T>, predicate: AsyncIteratee<T, boolean>) {
        return lazyFromOperator(_count, this, async input => {
            return await aseq(input)
                .reduce(
                    async (acc, element, index) =>
                        acc + ((await predicate(element, index)) ? 1 : 0),
                    0
                )
                .pull()
        })
    }
}

export default _count
