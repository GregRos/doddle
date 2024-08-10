import type { Lazy } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"

export default function generic<T>(caller: any, input: Seq<T>, index: number): Lazy<T | undefined> {
    chk(caller).index(index)
    return lazyFromOperator(input, function at(input) {
        if (index < 0) {
            return input.take(index).first().pull()
        }
        return input.skip(index).first().pull()
    })
}
