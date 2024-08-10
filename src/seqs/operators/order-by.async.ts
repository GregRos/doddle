import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

import { returnKvp } from "../../utils.js"
import { chk } from "../seq/_seq.js"
function orderBy<T, S>(
    this: AsyncIterable<T>,
    projection: ASeq.NoIndexIteratee<T, S>,
    reverse = false
): ASeq<T> {
    chk(orderBy).projection(projection)
    chk(orderBy).reverse(reverse)
    return ASeqOperator(this, async function* orderBy(input) {
        yield* await aseq(input)
            .map(e => returnKvp(e, projection(e), e))
            .toArray()
            .map(async xs => {
                xs.sort((a, b) => {
                    const comp = a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                    return reverse ? -comp : comp
                })
                return xs.map(x => x.value)
            })
            .pull()
    })
}
export default orderBy
