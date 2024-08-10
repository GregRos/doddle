import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"

export interface TakeWhileSpecifier {
    takeFinal?: boolean
}
function takeWhile<T>(
    this: AsyncIterable<T>,
    predicate: ASeq.Predicate<T>,
    specifier?: TakeWhileSpecifier
): ASeq<T> {
    chk(takeWhile).predicate(predicate)
    return ASeqOperator(this, async function* takeWhile(input) {
        let index = 0

        for await (const element of input) {
            if (await predicate(element, index++)) {
                yield element
            } else {
                if (specifier?.takeFinal) {
                    yield element
                }
                return
            }
        }
    }) as any
}
export default takeWhile
