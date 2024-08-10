import type { Seq } from "../seq/seq.class.js"
import generic from "./sum-by.js"

import { seq } from "../seq/seq.js"

function sumBy<T>(this: Iterable<T>, projection: Seq.Iteratee<T, number>) {
    return generic(sumBy, seq(this), projection)
}
export default sumBy
