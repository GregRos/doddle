import type { LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

function setEquals<T, S extends T>(
    this: AsyncIterable<T>,
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
function setEquals<T extends S, S>(
    this: AsyncIterable<T>,
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
function setEquals<T, S>(this: AsyncIterable<T>, _other: ASeq.SimpleInput<S>) {
    const other = aseq(_other)
    return lazyFromOperator(this, async function setEquals(input) {
        const set = new Set<T>() as Set<any>
        for await (const element of other) {
            set.add(element)
        }
        for await (const element of input) {
            if (!set.delete(element)) {
                return false
            }
        }
        return set.size === 0
    })
}
export default setEquals
