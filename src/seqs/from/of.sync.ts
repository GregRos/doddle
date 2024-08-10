import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function of<T>(...items: T[]): Seq<T> {
    return seq(items)
}
export default of
