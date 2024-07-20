import { syncFromOperator, asyncFromOperator, lazyFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
const _map = {
    name: "map",
    sync<T, S>(this: Iterable<T>, projection: Iteratee<T, S>) {
        return syncFromOperator(_map, this, function* (input) {
            let index = 0
            for (const element of input) {
                yield projection(element, index++)
            }
        })
    },
    async<T, S>(this: AsyncIterable<T>, projection: AsyncIteratee<T, S>) {
        return asyncFromOperator(_map, this, async function* (input) {
            let index = 0
            for await (const element of input) {
                yield await projection(element, index++)
            }
        })
    }
}

export default _map
