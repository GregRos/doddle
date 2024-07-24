import { asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type SeqLikeInput, type ASeqLikeInput } from "../f-types/index"
import { mustBeAsyncIterable, mustBeIterable } from "../errors/error"
import { fromAsyncInput, fromSyncInput } from "../from/input"

export function sync<T, S>(this: Iterable<T>, ..._iterables: SeqLikeInput<S>[]) {
    const iterables = _iterables.map(fromSyncInput)
    return syncFromOperator("concat", this, function* (input) {
        yield* input
        for (const iterable of iterables) {
            yield* iterable
        }
    })
}
export function async<T, S>(this: AsyncIterable<T>, ..._otherInputs: ASeqLikeInput<S>[]) {
    const inputs = _otherInputs.map(fromAsyncInput)
    return asyncFromOperator("concat", this, async function* (input) {
        for await (const element of input) {
            yield element
        }
        for (const iterable of inputs) {
            for await (const element of iterable) {
                yield element
            }
        }
    })
}
