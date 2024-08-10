import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"

export default function generic<T, K, V>(
    caller: any,
    input: Seq<T>,
    kvpProjection: Seq.Iteratee<T, readonly [K, V]>
) {
    kvpProjection = chk(caller).kvpProjection(kvpProjection)
    return lazyFromOperator(input, function toMap(input) {
        return input
            .map(kvpProjection)
            .toArray()
            .map(x => new Map(x))
            .pull()
    })
}
