import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

const END_MARKER = Symbol("DUMMY")
function take<T>(this: Iterable<T>, count: number): Seq<T> {
    chk(take).count(count)
    return SeqOperator(this, function* take(input) {
        let myCount = count
        if (myCount === 0) {
            yield* []
            return
        }
        if (myCount < 0) {
            myCount = -myCount
            const results = seq(input)
                .append(END_MARKER)
                .window(myCount + 1, (...window) => {
                    if (window[window.length - 1] === END_MARKER) {
                        window.pop()
                        return window as T[]
                    }
                    return undefined
                })
                .filter(x => x !== undefined)
                .first()
                .pull() as T[]

            yield* results
        } else {
            yield* seq(input).takeWhile((_, index) => index < myCount - 1, {
                takeFinal: true
            })
        }
    }) as any
}
export default take
