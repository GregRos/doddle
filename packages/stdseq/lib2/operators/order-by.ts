import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { aseq, seq } from "../ctors"

const _orderBy = {
    name: "orderBy",
    sync<T, S>(this: Iterable<T>, projection: (element: T) => S, reverse = false) {
        return syncFromOperator(_orderBy, this, function* (input) {
            yield* seq(input)
                .toArray()
                .map(xs => {
                    xs.sort((a, b) => {
                        const aKey = projection(a)
                        const bKey = projection(b)
                        return aKey < bKey ? -1 : aKey > bKey ? 1 : 0
                    })
                    return reverse ? xs.reverse() : xs
                })
                .pull()
        })
    },
    async<T, S>(this: AsyncIterable<T>, projection: AsyncIteratee<T, S>, reverse = false) {
        return asyncFromOperator(_orderBy, this, async function* (input) {
            const arr = await aseq(input)
                .map(async (element, index) => [await projection(element, index), element] as const)
                .toArray()
                .pull()

            yield* seq(arr)
                .orderBy(([key]) => key, reverse)
                .map(([, value]) => value)
        })
    }
}

export default _orderBy
