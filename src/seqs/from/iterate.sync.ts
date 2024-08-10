import { chk } from "../seq/load-checkers.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function iterate<T>(count: number, projection: Seq.IndexIteratee<T>): Seq<T> {
    chk(iterate).count(count)
    chk(iterate).projection(projection)
    return seq(function* () {
        for (let i = 0; i < count; i++) {
            yield projection(i)
        }
    })
}
export default iterate
