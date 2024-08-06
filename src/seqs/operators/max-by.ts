import type { Lazy, LazyAsync } from "../../lazy/index.js"

import { checkProjection } from "../../errors/error.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { returnKvp } from "../../utils.js"
import type { ASeq } from "../seq/aseq.class.js"
import { seq } from "../seq/seq.js"
const EMPTY = Symbol("EMPTY_SEQ")
export function generic<T, R, Alt>(input: Seq<T>, projection: Seq.Iteratee<T, R>, alt: Alt) {
    checkProjection(projection)
    return lazyFromOperator(input, function maxBy(input) {
        return input
            .map((element, index) => {
                return returnKvp(input, projection(element, index), element)
            })
            .reduce((max: any, value: any) => {
                return max.key >= value.key ? max : value
            }, EMPTY as any)
            .map(x => (x === EMPTY ? alt : x.value))
            .pull()
    })
}

export function sync<T, K>(this: Iterable<T>, projection: Seq.Iteratee<T, K>): Lazy<T | undefined>
export function sync<T, K, const Alt>(
    this: Iterable<T>,
    projection: Seq.Iteratee<T, K>,
    alt: Alt
): Lazy<T | Alt>
export function sync<T, K, Alt>(
    this: Iterable<T>,
    projection: Seq.Iteratee<T, K>,
    alt?: Alt
): Lazy<T | Alt> {
    return generic(seq(this), projection, alt)
}

export function async<T, K>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, K>
): LazyAsync<T | undefined>
export function async<T, K, const Alt>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, K>,
    alt?: Alt
): LazyAsync<T | Alt>
export function async<T, R>(this: AsyncIterable<T>, projection: ASeq.Iteratee<T, R>, alt?: any) {
    return generic(aseq(this) as any, projection as any, alt)
}
