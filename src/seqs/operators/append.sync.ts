import { SeqOperator, type Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function append<T, Items extends any[]>(
    this: Iterable<T>,
    ...items: Items
): Seq<T | Items[number]> {
    return SeqOperator(this, function* append(input) {
        yield* seq(input).concat(items)
    })
}
export default append
