import { isIterable, type Lazy, type LazyAsync } from "stdlazy"
import { mustBeFunction, mustReturnComparable } from "../errors/error"
import { AsyncIteratee, Iteratee } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
import { returnKvp } from "../special/utils"

export function generic<T, R>(input: Seq<T>, iteratee: Iteratee<T, R>) {
    mustBeFunction("iteratee", iteratee)
    return lazyFromOperator("maxBy", input, input => {
        return input
            .map((element, index) => {
                return returnKvp(input, iteratee(element, index), element)
            })
            .reduce((max: any, value) => {
                return max.key > value.key ? max : value
            })
            .pull()
    })
}

export function sync<T, K>(this: Iterable<T>, iteratee: Iteratee<T, K>): Lazy<T | undefined>
export function sync<T, K, Alt>(
    this: Iterable<T>,
    iteratee: Iteratee<T, K>,
    alt: Alt
): Lazy<T | Alt>
export function sync<T, K, Alt>(
    this: Iterable<T>,
    iteratee: Iteratee<T, K>,
    alt?: Alt
): Lazy<T | Alt> {
    return generic(seq(this), iteratee)
}

export function async<T, K>(
    this: AsyncIterable<T>,
    iteratee: AsyncIteratee<T, K>
): LazyAsync<T | undefined>
export function async<T, K, Alt>(
    this: AsyncIterable<T>,
    iteratee: AsyncIteratee<T, K>,
    alt: Alt
): LazyAsync<T | Alt>
export function async<T, R>(this: AsyncIterable<T>, iteratee: AsyncIteratee<T, R>) {
    return generic(aseq(this) as any, iteratee as any)
}
