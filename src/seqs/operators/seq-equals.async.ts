import type { LazyAsync } from "../../lazy/index.js"
import { _aiter } from "../../utils.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
function seqEquals<T extends S, S>(
    this: AsyncIterable<T>,
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
function seqEquals<T, S extends T>(
    this: AsyncIterable<T>,
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
function seqEquals<T>(this: AsyncIterable<T>, _other: ASeq.SimpleInput<T>) {
    const other = aseq(_other)
    return lazyFromOperator(this, async function seqEquals(input) {
        const otherIterator = _aiter(other)
        for await (const element of input) {
            const otherElement = await otherIterator.next()
            if (otherElement.done || element !== otherElement.value) {
                return false
            }
        }
        return !!(await otherIterator.next()).done
    })
}
export default seqEquals
