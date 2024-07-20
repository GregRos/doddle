import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _filter = {
    name: "filter",
    sync<T>(this: Iterable<T>, predicate: Iteratee<T, boolean>) {
        return syncFromOperator(_filter, this, function* (input) {
            let index = 0
            for (const element of input) {
                if (predicate(element, index++)) {
                    yield element
                }
            }
        })
    },
    async<T>(this: AsyncIterable<T>, predicate: AsyncIteratee<T, boolean>) {
        return asyncFromOperator(_filter, this, async function* (input) {
            let index = 0
            for await (const element of input) {
                if (await predicate(element, index++)) {
                    yield element
                }
            }
        })
    }
}

export default _filter
