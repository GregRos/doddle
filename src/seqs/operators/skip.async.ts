import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

const SKIP = Symbol("SKIP")
function skip<T>(this: AsyncIterable<T>, count: number): ASeq<T> {
    chk(skip).count(count)
    return ASeqOperator(this, async function* skip(input) {
        let myCount = count
        if (myCount === 0) {
            yield* aseq(input)
            return
        }
        if (myCount < 0) {
            myCount = -myCount
            yield* aseq(input)
                .window(myCount + 1, (...window) => {
                    if (window.length === myCount + 1) {
                        return window[0]
                    }
                    return SKIP
                })
                .filter(x => x !== SKIP)
        } else {
            yield* aseq(input).skipWhile((_, index) => index < myCount, {})
        }
    }) as any
}
export default skip
