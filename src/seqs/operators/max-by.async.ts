import type { LazyAsync } from "../../lazy/index.js"
import generic from "./max-by.js"

import { aseq } from "../seq/aseq.js"

import type { ASeq } from "../seq/aseq.class.js"

function maxBy<T, K>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, K>
): LazyAsync<T | undefined>
function maxBy<T, K, const Alt>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, K>,
    alt?: Alt
): LazyAsync<T | Alt>
function maxBy<T, R>(this: AsyncIterable<T>, projection: ASeq.Iteratee<T, R>, alt?: any) {
    return generic(maxBy, aseq(this) as any, projection as any, alt)
}
export default maxBy
