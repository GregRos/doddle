import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

function filter<T, S extends T>(this: AsyncIterable<T>, predicate: Seq.TypePredicate<T, S>): ASeq<S>
function filter<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): ASeq<T>
function filter<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>) {
    predicate = chk(filter).predicate(predicate)
    return ASeqOperator(this, async function* filter(input) {
        yield* aseq(input).concatMap(async (element, index) =>
            (await predicate(element, index)) ? [element] : []
        )
    })
}
export default filter
