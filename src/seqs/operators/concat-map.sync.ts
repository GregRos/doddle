import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
type getConcatElementType<T, S> = T extends never ? never : S
function concatMap<T, S>(
    this: Iterable<T>,
    projection: Seq.Iteratee<T, Seq.Input<S>>
): Seq<getConcatElementType<T, S>> {
    chk(concatMap).projection(projection)
    return SeqOperator(this, function* concatMap(input) {
        let index = 0
        for (const element of input) {
            for (const projected of seq(projection(element, index++))) {
                yield projected
            }
        }
    }) as any
}
export default concatMap
