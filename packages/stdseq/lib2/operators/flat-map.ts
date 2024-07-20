import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type SeqLikeInput } from "../f-types/index"
import { fromAsyncInput, fromSyncInput } from "../from/input"

const _flatMap = {
    name: "flatMap",
    sync<T, S>(this: Iterable<T>, projection: Iteratee<T, SeqLikeInput<S>>): Iterable<S> {
        return syncFromOperator(_flatMap, this, function* (input) {
            let index = 0
            for (const element of input) {
                for (const projected of fromSyncInput(projection(element, index++))) {
                    yield projected
                }
            }
        })
    },
    async<T, S>(
        this: AsyncIterable<T>,
        projection: AsyncIteratee<T, SeqLikeInput<S>>
    ): AsyncIterable<S> {
        return asyncFromOperator(_flatMap, this, async function* (input) {
            let index = 0
            for await (const element of input) {
                for await (const projected of fromAsyncInput(projection(element, index++))) {
                    yield projected
                }
            }
        })
    }
}

export default _flatMap
