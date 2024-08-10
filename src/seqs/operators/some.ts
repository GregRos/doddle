import type { Lazy } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"

const NO_MATCH = Symbol("NO_MATCH")

export default function some<T>(
    caller: any,
    input: Seq<T>,
    predicate: Seq.Predicate<T>
): Lazy<boolean> {
    predicate = chk(caller).predicate(predicate)
    return lazyFromOperator(input, function some(input) {
        return input
            .find(predicate, NO_MATCH)
            .map(x => x !== NO_MATCH)
            .pull()
    })
}
