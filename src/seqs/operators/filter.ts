import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T, S extends T>(this: Iterable<T>, predicate: Seq.TypePredicate<T, S>): Seq<S>
export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Seq<T>
export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>) {
    predicate = chk(sync).predicate(predicate)
    return SeqOperator(this, function* filter(input) {
        yield* seq(input).concatMap((element, index) =>
            predicate(element, index) ? [element] : []
        )
    })
}

export function async<T, S extends T>(
    this: AsyncIterable<T>,
    predicate: Seq.TypePredicate<T, S>
): ASeq<S>
export function async<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): ASeq<T>
export function async<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>) {
    predicate = chk(async).predicate(predicate)
    return ASeqOperator(this, async function* filter(input) {
        yield* aseq(input).concatMap(async (element, index) =>
            (await predicate(element, index)) ? [element] : []
        )
    })
}
