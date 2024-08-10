import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function uniq<T>(this: Iterable<T>) {
    return SeqOperator(this, function* uniq(input) {
        yield* seq(input).uniqBy(x => x)
    })
}
export default uniq
