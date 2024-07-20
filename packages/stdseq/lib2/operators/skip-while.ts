import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _skipWhile = {
    name: "skipWhile",
    sync<T, Ellipsis>(this: Iterable<T>, predicate: Iteratee<T, boolean>, ellipsisItem?: Ellipsis) {
        const hasEllipsis = arguments.length === 2
        return syncFromOperator(_skipWhile, this, function* (input) {
            let skipping = true
            let index = 0
            for (const element of input) {
                if (skipping && predicate(element, index++)) {
                    if (!predicate(element, index++)) {
                        if (index > 1 && hasEllipsis) {
                            yield ellipsisItem as Ellipsis
                        }
                        skipping = false
                        yield element
                    }
                } else {
                    yield element
                }
            }
        })
    },
    async<T, Ellipsis = T>(
        this: AsyncIterable<T>,
        predicate: AsyncIteratee<T, boolean>,
        ellipsisItem?: Ellipsis
    ) {
        const hasEllipsis = arguments.length === 2
        return asyncFromOperator(_skipWhile, this, async function* (input) {
            let skipping = true
            let index = 0
            for await (const element of input) {
                if (skipping) {
                    if (!(await predicate(element, index++))) {
                        if (index > 1 && hasEllipsis) {
                            yield ellipsisItem as Ellipsis
                        }
                        skipping = false
                        yield element
                    }
                } else {
                    yield element
                }
            }
        })
    }
}

export default _skipWhile
