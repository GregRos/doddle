import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { Seq } from "../wrappers"
import _reduce from "./reduce"
import { fromSyncInput } from "../from/input"
import { aseq, seq } from "../ctors"

const _maxBy = {
    name: "maxBy",
    sync<T, R>(this: Iterable<T>, iteratee: Iteratee<T, R>) {
        return lazyFromOperator(_maxBy, this, input => {
            return seq(input)
                .map((x, i) => {
                    return {
                        item: x,
                        key: iteratee(x, i)
                    }
                })
                .reduce((max, value) => {
                    return max.key > value.key ? max : value
                })
                .pull()
        })
    },
    async<T, R>(this: AsyncIterable<T>, iteratee: AsyncIteratee<T, R>) {
        return lazyFromOperator(_maxBy, this, async input => {
            return aseq(input)
                .map(async (x, i) => {
                    return {
                        item: x,
                        key: await iteratee(x, i)
                    }
                })
                .reduce(async (max, value) => {
                    return max.key > value.key ? max : value
                })
                .pull()
        })
    }
}

export default _maxBy
