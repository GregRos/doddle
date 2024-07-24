import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { seq } from "../seq"
import { aseq } from "../aseq"
import { mustBeInteger, mustBeNatural } from "../errors/error"

export function sync<T, Ellipsis = T>(this: Iterable<T>, count: number, ellipsis?: Ellipsis) {
    mustBeInteger("count", count)
    const hasEllipsis = ellipsis !== undefined
    return syncFromOperator("skip", this, function* (input) {
        if (count < 0) {
            count = -count
            yield* seq(input).window(count + 1, (...window) => {
                return window[0]
            })
            if (hasEllipsis) {
                yield ellipsis as Ellipsis
            }
        } else {
            yield* seq(input).skipWhile((_, index) => index < count, ellipsis)
        }
    })
}
export function async<T, Ellipsis = T>(this: AsyncIterable<T>, count: number, ellipsis?: Ellipsis) {
    mustBeInteger("count", count)
    const hasEllipsis = ellipsis !== undefined
    return asyncFromOperator("skip", this, async function* (input) {
        if (count < 0) {
            count = -count
            yield* aseq(input).window(count + 1, (...window) => {
                return window[0]
            })
            if (hasEllipsis) {
                yield ellipsis as Ellipsis
            }
        } else {
            yield* aseq(input).skipWhile((_, index) => index < count, ellipsis)
        }
    })
}
