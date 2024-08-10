import type { Lazy } from "../../lazy/index.js"
import type { Seq } from "../seq/seq.class.js"
import generic from "./some.js"

import { seq } from "../seq/seq.js"

function some<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    return generic(some, seq(this), predicate)
}
export default some
