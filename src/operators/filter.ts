import { mustBeFunction } from "../errors/error"
import { type AsyncPredicate, type Predicate, type TypePredicate } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

export function sync<T, S extends T>(this: Iterable<T>, predicate: TypePredicate<T, S>): Seq<S>
export function sync<T>(this: Iterable<T>, predicate: Predicate<T>): Seq<T>
export function sync<T>(this: Iterable<T>, predicate: Predicate<T>) {
    mustBeFunction("predicate", predicate)
    return syncFromOperator("filter", this, function* (input) {
        yield* seq(input).concatMap((element, index) =>
            predicate(element, index) ? [element] : []
        )
    })
}

export function async<T, S extends T>(
    this: AsyncIterable<T>,
    predicate: TypePredicate<T, S>
): ASeq<S>
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>): ASeq<T>
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>) {
    mustBeFunction("predicate", predicate)
    return asyncFromOperator("filter", this, async function* (input) {
        yield* aseq(input).concatMap(async (element, index) =>
            (await predicate(element, index)) ? [element] : []
        )
    })
}
