import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function repeat<T>(times: number, value: T): Seq<T> {
    return seq(function* () {
        for (let i = 0; i < times; i++) {
            yield value
        }
    })
}
export default repeat
