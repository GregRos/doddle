import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

function append<T, Items extends any[]>(
    this: AsyncIterable<T>,
    ...items: Items
): ASeq<T | Items[number]> {
    return ASeqOperator(this, async function* append(input) {
        yield* aseq(input).concat(items)
    })
}
export default append
