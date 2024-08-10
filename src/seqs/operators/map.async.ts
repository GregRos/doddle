import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

function map<T, S>(this: AsyncIterable<T>, projection: ASeq.Iteratee<T, S>): ASeq<S> {
    chk(map).projection(projection)
    return ASeqOperator(this, async function* map(input) {
        yield* aseq(input).concatMap(async (element, index) => [await projection(element, index)])
    })
}
export default map
