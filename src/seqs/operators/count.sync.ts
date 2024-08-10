import type { Lazy } from "../../lazy/index.js"
import type { Seq } from "../seq/seq.class.js"
import generic from "./count.js"

import { seq } from "../seq/seq.js"

function count<T>(this: Iterable<T>): Lazy<number>
function count<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<number>
function count<T>(this: Iterable<T>, predicate?: Seq.Predicate<T>): Lazy<number> {
    return generic(count, seq(this), predicate)
}
export default count
