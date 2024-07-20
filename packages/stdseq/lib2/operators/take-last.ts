import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _takeLast = {
    name: "takeLast",
    sync<T, Ellipsis = T>(this: Iterable<T>, count: number, ellipsis?: Ellipsis) {
        const hasEllipsis = arguments.length === 2
        return syncFromOperator(_takeLast, this, function* (input) {
            const buffer = Array<T>(count)
            let i = 0
            for (const item of input) {
                buffer[i++ % count] = item
            }
            if (hasEllipsis) {
                yield ellipsis!
            }
            if (i <= count) {
                yield* buffer.slice(0, i)
                return
            }
            yield buffer[i % count]
            for (let j = (i + 1) % count; j !== i % count; j = (j + 1) % count) {
                yield buffer[j]
            }
        })
    },
    async<T, Ellipsis = T>(this: AsyncIterable<T>, count: number, ellipsis?: Ellipsis) {
        const hasEllipsis = arguments.length === 2
        return asyncFromOperator(_takeLast, this, async function* (input) {
            const buffer = Array<T>(count)
            let i = 0
            for await (const item of input) {
                buffer[i++ % count] = item
            }
            if (hasEllipsis) {
                yield ellipsis!
            }
            if (i <= count) {
                yield* buffer.slice(0, i)
                return
            }
            yield buffer[i % count]
            for (let j = (i + 1) % count; j !== i % count; j = (j + 1) % count) {
                yield buffer[j]
            }
        })
    }
}

export default _takeLast
