import { mustBeFunction } from "../../errors/error"
import { ASeqOperator } from "../seq/aseq.class"
import { SeqOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
export function sync<T, S>(this: Iterable<T>, projection: Seq.Iteratee<T, S>): Seq<S> {
    mustBeFunction("projection", projection)
    return new SeqOperator(this, function* map(input) {
        yield* seq(input).concatMap((element, index) => [projection(element, index)])
    })
}
export function async<T, S>(this: AsyncIterable<T>, projection: ASeq.Iteratee<T, S>): ASeq<S> {
    mustBeFunction("projection", projection)
    return new ASeqOperator(this, async function* map(input) {
        yield* aseq(input).concatMap(async (element, index) => [await projection(element, index)])
    })
}
