import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

function concat<T, ASeqs extends ASeq.SimpleInput<any>[]>(
    this: AsyncIterable<T>,
    ..._otherInputs: ASeqs
): ASeq<T | ASeq.ElementOfInput<ASeqs[number]>> {
    const inputs = _otherInputs.map(aseq)
    return ASeqOperator(this, async function* concat(input) {
        for await (const element of input) {
            yield element
        }
        for (const iterable of inputs) {
            for await (const element of iterable) {
                yield element
            }
        }
    }) as any
}
export default concat
