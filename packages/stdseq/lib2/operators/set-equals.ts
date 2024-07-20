import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _setEquals = {
    name: "setEquals",
    sync<T>(this: Iterable<T>, other: Iterable<T>) {
        return lazyFromOperator(_setEquals, this, input => {
            const set = new Set(other)
            for (const element of input) {
                if (!set.delete(element)) {
                    return false
                }
            }
            return set.size === 0
        })
    },
    async<T>(this: AsyncIterable<T>, other: AsyncIterable<T>) {
        return lazyFromOperator(_setEquals, this, async input => {
            const set = new Set<T>()
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
}

export default _setEquals
