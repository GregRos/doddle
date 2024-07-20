import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _skipLast = {
    name: "skipLast",
    sync<T, Ellipsis = T>(this: Iterable<T>, count: number, ellipsisItem?: Ellipsis) {
        const hasEllipsis = arguments.length === 2
        return syncFromOperator(_skipLast, this, function* skipLast(input) {
            const buffer = Array<T | Ellipsis>(count)
            let i = 0
            for (const item of input) {
                if (i === count && hasEllipsis) {
                    yield ellipsisItem as Ellipsis
                }
                if (i >= count) {
                    yield buffer[i % count]
                }
                buffer[i % count] = item
                i++
            }
        })
    },
    async<T, Ellipsis = T>(this: AsyncIterable<T>, count: number, ellipsisItem?: Ellipsis) {
        const hasEllipsis = arguments.length === 2
        return asyncFromOperator(_skipLast, this, async function* skipLast(input) {
            const buffer = Array<T | Ellipsis>(count)
            let i = 0
            for await (const item of input) {
                if (i === count && hasEllipsis) {
                    yield ellipsisItem as Ellipsis
                }
                if (i >= count) {
                    yield buffer[i % count]
                }
                buffer[i % count] = item
                i++
            }
        })
    }
}

export default _skipLast
