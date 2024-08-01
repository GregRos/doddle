import { mustBeFunction } from "../errors/error"
import { AsyncIteratee, Iteratee } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
export function sync<T, S>(this: Iterable<T>, projection: Iteratee<T, S>): Seq<S> {
    mustBeFunction("projection", projection)
    return syncFromOperator("map", this, function* (input) {
        yield* seq(input).concatMap((element, index) => [projection(element, index)])
    })
}
export function async<T, S>(this: AsyncIterable<T>, projection: AsyncIteratee<T, S>): ASeq<S> {
    mustBeFunction("projection", projection)
    return asyncFromOperator("map", this, async function* (input) {
        yield* aseq(input).concatMap(async (element, index) => [await projection(element, index)])
    })
}
