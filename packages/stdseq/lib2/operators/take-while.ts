import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type AsyncPredicate, type Predicate } from "../f-types/index"
import { mustBeFunction } from "../errors/error"

export function sync<T, Ellipsis = T>(
    this: Iterable<T>,
    predicate: Predicate<T>,
    ellipsis?: Ellipsis
) {
    const hasEllipsis = arguments.length === 2
    mustBeFunction("predicate", predicate)
    return syncFromOperator("takeWhile", this, function* (input) {
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
}
export function async<T, Ellipsis = T>(
    this: AsyncIterable<T>,
    predicate: AsyncPredicate<T>,
    ellipsis?: Ellipsis
) {
    const hasEllipsis = arguments.length === 2
    mustBeFunction("predicate", predicate)
    return asyncFromOperator("takeWhile", this, async function* (input) {
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
