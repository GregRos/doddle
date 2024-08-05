import { mustBeFunction, mustReturnTuple } from "../../errors/error"
import type { LazyAsync } from "../../lazy"
import { lazyFromOperator } from "../lazy-operator"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
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
