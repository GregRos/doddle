import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

function reverse<T>(this: AsyncIterable<T>) {
    return ASeqOperator(this, async function* reverse(input) {
        yield* await aseq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
export default reverse
