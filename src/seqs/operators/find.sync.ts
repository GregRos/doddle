import type { Lazy } from "../../lazy/index.js"
import type { Seq } from "../seq/seq.class.js"
import generic from "./find.js"

import { seq } from "../seq/seq.js"

function find<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<T | undefined>
function find<T, const Alt>(this: Iterable<T>, predicate: Seq.Predicate<T>, alt: Alt): Lazy<T | Alt>
function find<T, Alt = T>(this: Iterable<T>, predicate: Seq.Predicate<T>, alt?: Alt) {
    return generic(find, seq(this), predicate, alt) as any
}
export default find
