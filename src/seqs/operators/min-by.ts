import { checkProjection } from "../../errors/error.js"
import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

import { returnKvp } from "../../utils.js"
const EMPTY = Symbol("EMPTY_SEQ")

export function generic<T, K, Alt>(input: Seq<T>, projection: Seq.Iteratee<T, K>, alt: Alt) {
    checkProjection(projection)
    return lazyFromOperator(input, function minBy(input) {
        return input
            .map((element, index) => {
                return returnKvp(input, projection(element, index), element)
            })
            .reduce((min: any, value: any) => {
                return min.key <= value.key ? min : value
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
export function sync<T, K>(this: Iterable<T>, projection: Seq.Iteratee<T, K>, alt?: any) {
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
export function async<T, K>(this: AsyncIterable<T>, projection: ASeq.Iteratee<T, K>, alt?: any) {
    return generic(aseq(this) as any, projection as any, alt)
}
