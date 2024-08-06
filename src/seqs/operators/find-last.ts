import { mustBeFunction } from "../../errors/error"
import type { Lazy, LazyAsync } from "../../lazy"
import { lazyFromOperator } from "../lazy-operator"
import { aseq } from "../seq/aseq"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq"

export function generic<T, Alt>(input: Seq<T>, predicate: Seq.Predicate<T>, alt?: Alt) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("findLast", input, input => {
        return input.filter(predicate).last(alt).pull() as any
    })
}

export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<T | undefined>
export function sync<T, const Alt>(
    this: Iterable<T>,
    predicate: Seq.Predicate<T>,
    alt: Alt
): Lazy<T | Alt>
export function sync<T, Alt = undefined>(
    this: Iterable<T>,
    predicate: Seq.Predicate<T>,
    alt?: Alt
) {
    return generic(seq(this), predicate, alt)
}

export function async<T>(
    this: AsyncIterable<T>,
    predicate: ASeq.Predicate<T>
): LazyAsync<T | undefined>
export function async<T, const Alt>(
    this: AsyncIterable<T>,
    predicate: ASeq.Predicate<T>,
    alt: Alt
): LazyAsync<T | Alt>
export function async<T, Alt = T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>, alt?: Alt) {
    return generic(aseq(this) as any, predicate as any, alt)
}
