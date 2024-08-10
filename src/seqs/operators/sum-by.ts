import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"

export default function generic<T>(
    caller: any,
    input: Seq<T>,
    projection: Seq.Iteratee<T, number>
) {
    chk(caller).projection(projection)
    return lazyFromOperator(input, function sumBy(input) {
        return input
            .map(projection)
            .reduce((acc, element) => acc + element, 0)
            .pull()
    })
}
