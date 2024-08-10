import type { Lazy } from "../../lazy/index.js"
import type { Seq } from "../seq/seq.class.js"
import generic from "./min-by.js"

import { seq } from "../seq/seq.js"

function minBy<T, K>(this: Iterable<T>, projection: Seq.Iteratee<T, K>): Lazy<T | undefined>
function minBy<T, K, const Alt>(
    this: Iterable<T>,
    projection: Seq.Iteratee<T, K>,
    alt: Alt
): Lazy<T | Alt>
function minBy<T, K>(this: Iterable<T>, projection: Seq.Iteratee<T, K>, alt?: any) {
    return generic(minBy, seq(this), projection, alt)
}
export default minBy
