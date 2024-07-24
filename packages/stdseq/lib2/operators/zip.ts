import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import {
    Iteratee,
    AsyncIteratee,
    type Reducer,
    type AsyncReducer,
    type ASeqLikeInput,
    type SeqLikeInput
} from "../f-types/index"
import { mustBeAsyncIterable, mustBeIterable } from "../errors/error"
import { fromAsyncInput, fromSyncInput } from "../from/input"
import type { Seq } from "../seq"
import type { ASeq } from "../aseq"

export function sync<T, Xs extends any[]>(
    this: Iterable<T>,
    ..._others: {
        [K in keyof Xs]: SeqLikeInput<Xs[K]>
    }
): Seq<[T, ...Xs]> {
    const others = _others.map(fromSyncInput)
    return syncFromOperator("zip", this, function* (input) {
        const iterators = [input, ...others].map(i => i[Symbol.iterator]())
        while (true) {
            const results = iterators.map(i => i.next())
            if (results.some(r => r.done)) {
                break
            }
            yield results.map(r => r.value) as any
        }
    })
}
export function async<T, Xs extends any[]>(
    this: AsyncIterable<T>,
    ..._others: {
        [K in keyof Xs]: ASeqLikeInput<Xs[K]>
    }
): ASeq<[T, ...Xs]> {
    const others = _others.map(fromAsyncInput)
    return asyncFromOperator("zip", this, async function* (input) {
        const iterators = [input, ...others].map(i => i[Symbol.asyncIterator]())
        while (true) {
            const results = await Promise.all(iterators.map(async i => i.next()))
            if (results.some(r => r.done)) {
                break
            }
            yield results.map(r => r.value) as any
        }
    })
}