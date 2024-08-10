import type { Lazy } from "../../lazy/index.js"
import { _iter } from "../../utils.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { Seq } from "../seq/seq.class.js"
import { seq } from "../seq/seq.js"
function seqEquals<T extends S, S>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
function seqEquals<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
function seqEquals<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>) {
    const other = seq(_other)
    return lazyFromOperator(this, function seqEquals(input) {
        const otherIterator = _iter(other)
        for (const element of input) {
            const otherElement = otherIterator.next()
            if (otherElement.done || element !== otherElement.value) {
                return false
            }
        }
        return !!otherIterator.next().done
    })
}
export default seqEquals
