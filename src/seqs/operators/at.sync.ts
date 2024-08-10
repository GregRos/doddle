import type { Lazy } from "../../lazy/index.js"
import generic from "./at.js"

import { seq } from "../seq/seq.js"

function at<T>(this: Iterable<T>, index: number): Lazy<T | undefined> {
    return generic(at, seq(this), index) as any
}
export default at
