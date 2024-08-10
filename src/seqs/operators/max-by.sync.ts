import type { Lazy } from "../../lazy/index.js"
import generic from "./max-by.js"

import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

function maxBy<T, K>(this: Iterable<T>, projection: Seq.Iteratee<T, K>): Lazy<T | undefined>
function maxBy<T, K, const Alt>(
    this: Iterable<T>,
    projection: Seq.Iteratee<T, K>,
    alt: Alt
): Lazy<T | Alt>
function maxBy<T, K, Alt>(
    this: Iterable<T>,
    projection: Seq.Iteratee<T, K>,
    alt?: Alt
): Lazy<T | Alt> {
    return generic(maxBy, seq(this), projection, alt)
}
export default maxBy
