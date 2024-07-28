import type { LazyAsync } from "stdlazy"
import { mustBeFunction, mustReturnTuple } from "../errors/error"
import { AsyncIteratee, Iteratee } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
const mustReturnPair = mustReturnTuple(2)
export function generic<T, K, V>(input: Seq<T>, projection: Iteratee<T, readonly [K, V]>) {
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
export function sync<T, K, V>(this: Iterable<T>, projection: Iteratee<T, readonly [K, V]>) {
    return generic(seq(this), projection)
}
export function async<T, K, V>(
    this: AsyncIterable<T>,
    projection: AsyncIteratee<T, readonly [K, V]>
): LazyAsync<Map<K, V>> {
    return generic(aseq(this) as any, projection as any) as any
}
