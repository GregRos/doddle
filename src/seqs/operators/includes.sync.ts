import type { Lazy } from "../../lazy/index.js"
import generic from "./includes.js"

import { seq } from "../seq/seq.js"

function includes<T>(this: Iterable<T>, value: T): Lazy<boolean> {
    return generic(seq(this), value)
}
export default includes
