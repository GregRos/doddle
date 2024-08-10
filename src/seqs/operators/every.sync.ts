import type { Lazy } from "../../lazy/index.js"
import type { Seq } from "../seq/seq.class.js"
import generic from "./every.js"

import { seq } from "../seq/seq.js"

function every<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    return generic(every, seq(this), predicate)
}
export default every
