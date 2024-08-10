import { SeqOperator, type Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

import { returnKvp } from "../../utils.js"
import { chk } from "../seq/_seq.js"
function orderBy<T>(
    this: Iterable<T>,
    projection: Seq.NoIndexIteratee<T, any>,
    reverse = false
): Seq<T> {
    chk(orderBy).projection(projection)
    chk(orderBy).reverse(reverse)
    return SeqOperator(this, function* orderBy(input) {
        yield* seq(input)
            .map(e => returnKvp(e, projection(e), e))
            .toArray()
            .map(xs => {
                void xs.sort((a: any, b: any) => {
                    const result = a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                    return reverse ? -result : result
                })
                return xs.map((x: any) => x.value)
            })
            .pull()
    })
}
export default orderBy
