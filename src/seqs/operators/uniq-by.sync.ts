import { chk } from "../seq/_seq.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"
function uniqBy<T>(this: Iterable<T>, projection: Seq.NoIndexIteratee<T, any>): Seq<T> {
    chk(uniqBy).projection(projection)
    return SeqOperator(this, function* uniqBy(input) {
        const seen = new Set()
        for (const element of input) {
            const key = projection(element)
            if (!seen.has(key)) {
                seen.add(key)
                yield element
            }
        }
    })
}
export default uniqBy
