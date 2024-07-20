import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import _reduce from "./reduce"
import _map from "./map"
import { aseq, seq } from "../ctors"

const _minBy = {
    name: "minBy",
    sync<T, K>(this: Iterable<T>, iteratee: Iteratee<T, K>) {
        return lazyFromOperator(_minBy, this, input => {
            return seq(input)
                .map((element, index) => {
                    return { key: iteratee(element, index), value: element }
                })
                .reduce((min, value) => {
                    return min.key < value.key ? min : value
                })
                .pull()
        })
    },
    async<T, K>(this: AsyncIterable<T>, iteratee: AsyncIteratee<T, K>) {
        return lazyFromOperator(_minBy, this, async input => {
            return await aseq(input)
                .map(async (element, index) => {
                    return { key: await iteratee(element, index), value: element }
                })
                .reduce(async (min, value) => {
                    return min.key < value.key ? min : value
                })
                .pull()
        })
    }
}

export default _minBy
