import type { Lazy } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"

export default function count<T>(
    caller: any,
    input: Seq<T>,
    predicate?: Seq.Predicate<T>
): Lazy<number> {
    predicate ??= () => true
    predicate = chk(caller).predicate(predicate)
    return lazyFromOperator(input, function count(input) {
        return input
            .filter(predicate ?? (() => true))
            .reduce(acc => acc + 1, 0)
            .pull()
    })
}
