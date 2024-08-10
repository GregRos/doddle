import type { Lazy } from "../../lazy/index.js"
import type { Seq } from "../seq/seq.class.js"
import generic from "./find-last.js"

import { seq } from "../seq/seq.js"

function findLast<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<T | undefined>
function findLast<T, const Alt>(
    this: Iterable<T>,
    predicate: Seq.Predicate<T>,
    alt: Alt
): Lazy<T | Alt>
function findLast<T, Alt = undefined>(this: Iterable<T>, predicate: Seq.Predicate<T>, alt?: Alt) {
    return generic(findLast, seq(this), predicate, alt)
}
export default findLast
