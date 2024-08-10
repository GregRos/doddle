import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function reverse<T>(this: Iterable<T>) {
    return SeqOperator(this, function* reverse(input) {
        yield* seq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
export default reverse
