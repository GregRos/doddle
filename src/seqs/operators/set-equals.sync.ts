import type { Lazy } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function setEquals<T extends S, S>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
function setEquals<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
function setEquals<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>) {
    const other = seq(_other)
    return lazyFromOperator(this, function setEquals(input) {
        const set = new Set(other) as Set<any>
        for (const element of input) {
            if (!set.delete(element)) {
                return false
            }
        }
        return set.size === 0
    })
}
export default setEquals
