import { lazyFromOperator } from "../lazy-operator.js"

import type { Lazy } from "../../lazy/index.js"

import type { Seq } from "../seq/seq.class.js"

import { Doddle } from "../../errors/error.js"
import { chk } from "../seq/_seq.js"
const NO_INITIAL = Symbol("NO_INTIAL")

export default function generic<Item, Acc>(
    caller: any,
    input: Seq<Item>,
    reducer: Seq.Reducer<Item, Acc>,
    initial?: Acc
): Lazy<any> {
    chk(caller).reducer(reducer)
    return lazyFromOperator(input, function reduce(input) {
        return input
            .scan(reducer, initial!)
            .last(NO_INITIAL)
            .map(x => {
                if (x === NO_INITIAL) {
                    throw new Doddle("Cannot reduce empty sequence with no initial value")
                }
                return x
            })
            .pull()
    }) as any
}
