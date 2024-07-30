import type { Lazy, LazyAsync } from "stdlazy"
import { mustBeFunction } from "../errors/error"
import { AsyncIteratee, Iteratee } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
import { returnKvp } from "../special/utils"

export function generic<T, K>(input: Seq<T>, iteratee: Iteratee<T, K>) {
    mustBeFunction("iteratee", iteratee)
    return lazyFromOperator("minBy", input, input => {
        return input
            .map((element, index) => {
                return returnKvp(input, iteratee(element, index), element)
            })
            .reduce((min: any, value) => {
                return min.key <= value.key ? min : value
            })
            .pull()
    })
}

export function sync<T, K, Alt>(this: Iterable<T>, iteratee: Iteratee<T, K>): Lazy<T | undefined>
export function sync<T, K, const Alt>(
    this: Iterable<T>,
    iteratee: Iteratee<T, K>,
    alt: Alt
): Lazy<T | Alt>
export function sync<T, K>(this: Iterable<T>, iteratee: Iteratee<T, K>) {
    return generic(seq(this), iteratee)
}

export function async<T, K>(
    this: AsyncIterable<T>,
    iteratee: AsyncIteratee<T, K>
): LazyAsync<T | undefined>
export function async<T, K, const Alt>(
    this: AsyncIterable<T>,
    iteratee: AsyncIteratee<T, K>,
    alt?: Alt
): LazyAsync<T | Alt>
export function async<T, K>(this: AsyncIterable<T>, iteratee: AsyncIteratee<T, K>) {
    return generic(aseq(this) as any, iteratee as any)
}
