import { asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _concat = {
    name: "concat",
    sync<T>(this: Iterable<T>, ...iterables: Iterable<T>[]) {
        return syncFromOperator(_concat, this, function* (input) {
            yield* input
            for (const iterable of iterables) {
                yield* iterable
            }
        })
    },
    async<T>(this: AsyncIterable<T>, ...iterables: AsyncIterable<T>[]) {
        return asyncFromOperator(_concat, this, async function* (input) {
            for await (const element of input) {
                yield element
            }
            for (const iterable of iterables) {
                for await (const element of iterable) {
                    yield element
                }
            }
        })
    }
}

export default _concat
