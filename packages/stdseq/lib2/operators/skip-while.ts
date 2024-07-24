import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type Predicate, type AsyncPredicate } from "../f-types/index"
import { mustBeFunction } from "../errors/error"

export function sync<T, Ellipsis>(
    this: Iterable<T>,
    predicate: Predicate<T>,
    ellipsisItem?: Ellipsis
) {
    const hasEllipsis = ellipsisItem !== undefined
    mustBeFunction("predicate", predicate)
    return syncFromOperator("skipWhile", this, function* (input) {
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
}
export function async<T, Ellipsis = T>(
    this: AsyncIterable<T>,
    predicate: AsyncPredicate<T>,
    ellipsisItem?: Ellipsis
) {
    const hasEllipsis = ellipsisItem !== undefined
    mustBeFunction("predicate", predicate)
    return asyncFromOperator("skipWhile", this, async function* (input) {
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
