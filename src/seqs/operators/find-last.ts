import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"

export default function generic<T, Alt>(
    caller: any,
    input: Seq<T>,
    predicate: Seq.Predicate<T>,
    alt?: Alt
) {
    predicate = chk(caller).predicate(predicate)
    return lazyFromOperator(input, function findLast(input) {
        return input.filter(predicate).last(alt).pull() as any
    })
}
