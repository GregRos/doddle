import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { chk } from "../seq/load-checkers.js"

function iterate<T>(count: number, projection: ASeq.IndexIteratee<T>): ASeq<T> {
    chk(iterate).count(count)
    chk(iterate).projection(projection)
    return aseq(async function* () {
        for (let i = 0; i < count; i++) {
            yield projection(i)
        }
    })
}
export default iterate
