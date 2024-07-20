import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _takeWhile = {
    name: "takeWhile",
    sync<T, Ellipsis = T>(this: Iterable<T>, predicate: Iteratee<T, boolean>, ellipsis?: Ellipsis) {
        const hasEllipsis = arguments.length === 2
        return syncFromOperator(_takeWhile, this, function* (input) {
            let index = 0
            for (const element of input) {
                if (predicate(element, index++)) {
                    yield element
                } else {
                    if (hasEllipsis) {
                        yield ellipsis as Ellipsis
                    }
                    return
                }
            }
        })
    },
    async<T, Ellipsis = T>(
        this: AsyncIterable<T>,
        predicate: AsyncIteratee<T, boolean>,
        ellipsis?: Ellipsis
    ) {
        const hasEllipsis = arguments.length === 2

        return asyncFromOperator(_takeWhile, this, async function* (input) {
            let index = 0

            for await (const element of input) {
                if (await predicate(element, index++)) {
                    yield element
                } else {
                    if (hasEllipsis) {
                        yield ellipsis as Ellipsis
                    }
                    return
                }
            }
        })
    }
}

export default _takeWhile
