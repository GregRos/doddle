import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function generic<T, Alt>(
    caller: any,
    input: Seq<T>,
    predicate: Seq.Predicate<T>,
    alt?: Alt
) {
    predicate = chk(caller).predicate(predicate)
    return lazyFromOperator(input, function findLast(input) {
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
    return generic(sync, seq(this), predicate, alt)
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
    return generic(async, aseq(this) as any, predicate as any, alt)
}
