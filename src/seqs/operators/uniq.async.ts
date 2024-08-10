import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

function uniq<T>(this: AsyncIterable<T>) {
    return ASeqOperator(this, async function* uniq(input) {
        yield* aseq(input).uniqBy(x => x)
    })
}
export default uniq
