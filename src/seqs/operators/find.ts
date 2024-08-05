import { mustBeFunction } from "../../errors/error"
import { lazyFromOperator } from "../lazy-operator"
import type { Lazy, LazyAsync } from "../../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

export function generic<T, Alt>(input: Seq<T>, predicate: Seq.Predicate<T>, alt?: Alt) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("find", input, input => {
        return input.filter(predicate).first(alt).pull() as any
    })
}

export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<T | undefined>
export function sync<T, const Alt>(
    this: Iterable<T>,
    predicate: Seq.Predicate<T>,
    alt: Alt
): Lazy<T | Alt>
export function sync<T, Alt = T>(this: Iterable<T>, predicate: Seq.Predicate<T>, alt?: Alt) {
    return generic(seq(this), predicate, alt) as any
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
    return generic(aseq(this) as any, predicate as any, alt) as any
}
