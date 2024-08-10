import { lazyFromOperator } from "../lazy-operator.js"
import type { Seq } from "../seq/seq.class.js"

export default function generic<T>(input: Seq<T>, value: T) {
    return lazyFromOperator(input, function includes(input) {
        return input.some(element => element === value).pull()
    })
}
