import { lazyFromOperator } from "../lazy-operator.js"
import type { Seq } from "../seq/seq.class.js"

import { returnKvp } from "../../utils.js"
import { chk } from "../seq/_seq.js"
const EMPTY = Symbol("EMPTY_SEQ")

export default function generic<T, R, Alt>(
    caller: any,
    input: Seq<T>,
    projection: Seq.Iteratee<T, R>,
    alt: Alt
) {
    chk(caller).projection(projection)
    return lazyFromOperator(input, function maxBy(input) {
        return input
            .map((element, index) => {
                return returnKvp(input, projection(element, index), element)
            })
            .reduce((max: any, value: any) => {
                return max.key >= value.key ? max : value
            }, EMPTY as any)
            .map(x => (x === EMPTY ? alt : x.value))
            .pull()
    })
}
