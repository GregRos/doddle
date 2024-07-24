import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type SeqLikeInput, type ASeqLikeInput } from "../f-types/index"
import { fromAsyncInput, fromSyncInput } from "../from/input"
import { mustBeFunction } from "../errors/error"

export function sync<T, S>(
    this: Iterable<T>,
    projection: Iteratee<T, SeqLikeInput<S>>
): Iterable<S> {
    mustBeFunction("projection", projection)
    return syncFromOperator("concatMap", this, function* (input) {
        let index = 0
        for (const element of input) {
            for (const projected of fromSyncInput(projection(element, index++))) {
                yield projected
            }
        }
    })
}
export function async<T, S>(
    this: AsyncIterable<T>,
    projection: AsyncIteratee<T, ASeqLikeInput<S>>
): AsyncIterable<S> {
    mustBeFunction("projection", projection)
    return asyncFromOperator("concatMap", this, async function* (input) {
        let index = 0
        for await (const element of input) {
            for await (const projected of fromAsyncInput(await projection(element, index++))) {
                yield projected
            }
        }
    })
}
