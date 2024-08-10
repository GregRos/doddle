import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

export interface TakeWhileSpecifier {
    takeFinal?: boolean
}
function takeWhile<T>(
    this: Iterable<T>,
    predicate: Seq.Predicate<T>,
    specifier?: TakeWhileSpecifier
): Seq<T> {
    chk(takeWhile).predicate(predicate)
    return SeqOperator(this, function* takeWhile(input) {
        let index = 0
        for (const element of input) {
            if (predicate(element, index++)) {
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
