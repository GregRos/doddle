import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function map<T, S>(this: Iterable<T>, projection: Seq.Iteratee<T, S>): Seq<S> {
    chk(map).projection(projection)
    return SeqOperator(this, function* map(input) {
        yield* seq(input).concatMap((element, index) => [projection(element, index)])
    })
}
export default map
