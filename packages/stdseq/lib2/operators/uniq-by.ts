import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _uniqBy = {
    name: "uniqBy",
    sync<T>(this: Iterable<T>, projection: Iteratee<T, any>) {
        return lazyFromOperator(_uniqBy, this, function* (input) {
            const seen = new Set()
            let index = 0
            for (const element of input) {
                const key = projection(element, index++)
                if (!seen.has(key)) {
                    seen.add(key)
                    yield element
                }
            }
        })
    },
    async<T>(this: AsyncIterable<T>, projection: AsyncIteratee<T, any>) {
        return lazyFromOperator(_uniqBy, this, async function* (input) {
            const seen = new Set()
            let index = 0
            for await (const element of input) {
                const key = await projection(element, index++)
                if (!seen.has(key)) {
                    seen.add(key)
                    yield element
                }
            }
        })
    }
}

export default _uniqBy
