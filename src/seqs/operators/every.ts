import type { Lazy } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"

export default function every<T>(
    caller: any,
    input: Seq<T>,
    predicate: Seq.Predicate<T>
): Lazy<boolean> {
    predicate = chk(caller).predicate(predicate)
    return lazyFromOperator(input, function every(input) {
        return input
            .map(predicate)
            .some(x => !x)
            .pull()
    }).map(x => !x)
}
