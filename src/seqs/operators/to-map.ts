import { mustBeFunction, mustReturnTuple } from "../../errors/error.js"
import type { LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
const mustReturnPair = mustReturnTuple(2)
export function generic<T, K, V>(input: Seq<T>, projection: Seq.Iteratee<T, readonly [K, V]>) {
    mustBeFunction("projection", projection)
    return lazyFromOperator("toMap", input, input => {
        return input
            .map(projection)
            .each(x => {
                mustReturnPair("projection", x)
            })
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
