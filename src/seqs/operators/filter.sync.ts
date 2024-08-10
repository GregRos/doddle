import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function filter<T, S extends T>(this: Iterable<T>, predicate: Seq.TypePredicate<T, S>): Seq<S>
function filter<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Seq<T>
function filter<T>(this: Iterable<T>, predicate: Seq.Predicate<T>) {
    predicate = chk(filter).predicate(predicate)
    return SeqOperator(this, function* filter(input) {
        yield* seq(input).concatMap((element, index) =>
            predicate(element, index) ? [element] : []
        )
    })
}
export default filter
