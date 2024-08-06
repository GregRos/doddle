import { checkPairProjectionReturn, checkProjection } from "../../errors/error.js"
import type { LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
export function generic<T, K, V>(input: Seq<T>, projection: Seq.Iteratee<T, readonly [K, V]>) {
    checkProjection(projection)
    return lazyFromOperator(input, function toMap(input) {
        return input
            .map(projection)
            .each(checkPairProjectionReturn)
            .toArray()
            .map(x => new Map(x))
            .pull()
    })
}
export function sync<T, K, V>(this: Iterable<T>, projection: Seq.Iteratee<T, readonly [K, V]>) {
    return generic(seq(this), projection)
}
export function async<T, K, V>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, readonly [K, V]>
): LazyAsync<Map<K, V>> {
    return generic(aseq(this) as any, projection as any) as any
}
