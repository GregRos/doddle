import { mustBeFunction } from "../../errors/error"
import type { ASeq } from "../seq/aseq.class"
import { ASeqOperator } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { SeqOperator } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

export function sync<T, S extends T>(this: Iterable<T>, predicate: Seq.TypePredicate<T, S>): Seq<S>
export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Seq<T>
export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>) {
    mustBeFunction("predicate", predicate)
    return new SeqOperator(this, function* filter(input) {
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
    mustBeFunction("predicate", predicate)
    return new ASeqOperator(this, async function* filter(input) {
        yield* aseq(input).concatMap(async (element, index) =>
            (await predicate(element, index)) ? [element] : []
        )
    })
}
