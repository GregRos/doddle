import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

export interface SkipWhileOptions {
    skipFinal?: boolean
}
const enum SkippingMode {
    None = 0,
    Skipping = 1,
    NotSkipping = 2
}
function skipWhile<T>(
    this: Iterable<T>,
    predicate: Seq.Predicate<T>,
    options?: SkipWhileOptions
): Seq<T> {
    predicate = chk(skipWhile).predicate(predicate)
    return SeqOperator(this, function* skipWhile(input) {
        let prevMode = SkippingMode.None as SkippingMode
        let index = 0
        for (const element of input) {
            if (prevMode === SkippingMode.NotSkipping) {
                yield element
                continue
            }
            const newSkipping: boolean = predicate(element, index++)
            if (!newSkipping) {
                if (prevMode !== SkippingMode.Skipping || !options?.skipFinal) {
                    yield element
                }
            }
            prevMode = newSkipping ? SkippingMode.Skipping : SkippingMode.NotSkipping
        }
    }) as any
}
export default skipWhile
