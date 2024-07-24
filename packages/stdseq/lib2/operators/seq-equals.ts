import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type Eq, type SeqLikeInput } from "../f-types/index"
import { mustBeAsyncIterable, mustBeFunction } from "../errors/error"
import { fromAsyncInput, fromSyncInput } from "../from/input"

export function sync<T>(this: Iterable<T>, _other: SeqLikeInput<T>) {
    const other = fromSyncInput(_other)
    return lazyFromOperator("seqEquals", this, input => {
        const otherIterator = other[Symbol.iterator]()
        for (const element of input) {
            const otherElement = otherIterator.next()
            if (otherElement.done || element !== otherElement.value) {
                return false
            }
        }
        return otherIterator.next().done
    })
}
export function async<T>(this: AsyncIterable<T>, _other: AsyncIterable<T>) {
    const other = fromAsyncInput(_other)
    return lazyFromOperator("seqEquals", this, async input => {
        const otherIterator = other[Symbol.asyncIterator]()
        for await (const element of input) {
            const otherElement = await otherIterator.next()
            if (otherElement.done || element !== otherElement.value) {
                return false
            }
        }
        return (await otherIterator.next()).done
    })
}
