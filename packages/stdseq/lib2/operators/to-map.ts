import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import _toArray from "./to-array"
import _map from "./map"
import { aseq, seq } from "../ctors"

const _toMap = {
    name: "toMap",
    sync<T, K, V>(this: Iterable<T>, selector: Iteratee<T, [K, V]>) {
        return lazyFromOperator(_toMap, this, input => {
            const result = seq(input).map(selector).toArray().pull()
            return new Map(result)
        })
    },
    async<T, K, V>(this: AsyncIterable<T>, projection: AsyncIteratee<T, [K, V]>) {
        return lazyFromOperator(_toMap, this, async input => {
            const result = await aseq(input).map(projection).toArray().pull()
            return new Map(result)
        })
    }
}

export default _toMap
