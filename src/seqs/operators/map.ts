import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
export function sync<T, S>(this: Iterable<T>, projection: Seq.Iteratee<T, S>): Seq<S> {
    chk(sync).projection(projection)
    return SeqOperator(this, function* map(input) {
        yield* seq(input).concatMap((element, index) => [projection(element, index)])
    })
}
export function async<T, S>(this: AsyncIterable<T>, projection: ASeq.Iteratee<T, S>): ASeq<S> {
    chk(async).projection(projection)
    return ASeqOperator(this, async function* map(input) {
        yield* aseq(input).concatMap(async (element, index) => [await projection(element, index)])
    })
}
