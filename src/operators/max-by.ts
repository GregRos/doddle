import type { Lazy, LazyAsync } from "../lazy"

import { mustBeFunction } from "../errors/error"
import { lazyFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
import { returnKvp } from "../special/utils"
import type { ASeq } from "../seq/aseq.class"
const EMPTY = Symbol("EMPTY_SEQ")
export function generic<T, R, Alt>(input: Seq<T>, iteratee: Seq.Iteratee<T, R>, alt: Alt) {
    mustBeFunction("iteratee", iteratee)
    return lazyFromOperator("maxBy", input, input => {
        return input
            .map((element, index) => {
                return returnKvp(input, iteratee(element, index), element)
            })
            .reduce((max: any, value: any) => {
                return max.key >= value.key ? max : value
            }, EMPTY as any)
            .map(x => (x === EMPTY ? alt : x.value))
            .pull()
    })
}

export function sync<T, K, Alt>(
    this: Iterable<T>,
    iteratee: Seq.Iteratee<T, K>
): Lazy<T | undefined>
export function sync<T, K, const Alt>(
    this: Iterable<T>,
    iteratee: Seq.Iteratee<T, K>,
    alt: Alt
): Lazy<T | Alt>
export function sync<T, K, Alt>(
    this: Iterable<T>,
    iteratee: Seq.Iteratee<T, K>,
    alt?: Alt
): Lazy<T | Alt> {
    return generic(seq(this), iteratee, alt)
}

export function async<T, K>(
    this: AsyncIterable<T>,
    iteratee: ASeq.Iteratee<T, K>
): LazyAsync<T | undefined>
export function async<T, K, const Alt>(
    this: AsyncIterable<T>,
    iteratee: ASeq.Iteratee<T, K>,
    alt?: Alt
): LazyAsync<T | Alt>
export function async<T, R>(this: AsyncIterable<T>, iteratee: ASeq.Iteratee<T, R>, alt?: any) {
    return generic(aseq(this) as any, iteratee as any, alt)
}
