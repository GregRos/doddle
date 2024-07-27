import type { Lazy, LazyAsync } from "stdlazy"
import { mustBeFunction } from "../errors/error"
import { type AsyncPredicate, type Predicate } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

export function generic<T, Alt>(input: Seq<T>, predicate: Predicate<T>, alt?: Alt) {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("findLast", input, input => {
        return input.filter(predicate).last(alt).pull() as any
    })
}

export function sync<T>(this: Iterable<T>, predicate: Predicate<T>): Lazy<T | undefined>
export function sync<T, const Alt>(
    this: Iterable<T>,
    predicate: Predicate<T>,
    alt: Alt
): Lazy<T | Alt>
export function sync<T, Alt = undefined>(this: Iterable<T>, predicate: Predicate<T>, alt?: Alt) {
    return generic(seq(this), predicate, alt)
}

export function async<T>(
    this: AsyncIterable<T>,
    predicate: AsyncPredicate<T>
): LazyAsync<T | undefined>
export function async<T, const Alt>(
    this: AsyncIterable<T>,
    predicate: AsyncPredicate<T>,
    alt: Alt
): LazyAsync<T | Alt>
export function async<T, Alt = T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>, alt?: Alt) {
    return generic(aseq(this) as any, predicate as any, alt)
}
