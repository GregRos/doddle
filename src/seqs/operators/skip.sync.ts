import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

const SKIP = Symbol("SKIP")
function skip<T>(this: Iterable<T>, count: number): Seq<T> {
    chk(skip).count(count)
    return SeqOperator(this, function* skip(input) {
        let myCount = count
        if (myCount === 0) {
            yield* seq(input)
            return
        }
        if (myCount < 0) {
            myCount = -myCount
            yield* seq(input)
                .window(myCount + 1, (...window) => {
                    if (window.length === myCount + 1) {
                        return window[0]
                    }
                    return SKIP
                })
                .filter(x => x !== SKIP)
        } else {
            yield* seq(input).skipWhile((_, index) => index < myCount, {})
        }
    }) as any
}
export default skip
