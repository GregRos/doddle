import type { LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
export function generic<T, K, V>(
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
export function sync<T, K, V>(this: Iterable<T>, kvpProjection: Seq.Iteratee<T, readonly [K, V]>) {
    return generic(sync, seq(this), kvpProjection)
}
export function async<T, K, V>(
    this: AsyncIterable<T>,
    kvpProjection: ASeq.Iteratee<T, readonly [K, V]>
): LazyAsync<Map<K, V>> {
    return generic(async, aseq(this) as any, kvpProjection as any) as any
}
