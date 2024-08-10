import { chk } from "../seq/_seq.js"
import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
function uniqBy<T>(this: AsyncIterable<T>, projection: ASeq.NoIndexIteratee<T, any>): ASeq<T> {
    chk(uniqBy).projection(projection)
    return ASeqOperator(this, async function* uniqBy(input) {
        const seen = new Set()
        for await (const element of input) {
            const key = await projection(element)
            if (!seen.has(key)) {
                seen.add(key)
                yield element
            }
        }
    })
}
export default uniqBy
