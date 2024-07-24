import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { seq } from "../seq"
import { aseq } from "../aseq"
import { mustBeInteger, mustBeNatural } from "../errors/error"

const END_MARKER = Symbol("DUMMY")
export function sync<T, Ellipsis = T>(this: Iterable<T>, count: number, ellipsis?: Ellipsis) {
    mustBeInteger("count", count)
    return syncFromOperator("take", this, function* (input) {
        if (count < 0) {
            count = -count
            let anySkipped = false
            const results = seq(input)
                .append(END_MARKER)
                .window(
                    count + 1,
                    (...window) => {
                        if (window[window.length - 1] === END_MARKER) {
                            window.pop()
                            return window as T[]
                        }
                        anySkipped = true
                        return undefined
                    },
                    true
                )
                .filter(x => x !== undefined)
                .first()
                .pull() as T[]
            if (anySkipped && ellipsis !== undefined) {
                yield ellipsis
            }
        } else {
            yield* seq(input).takeWhile((_, index) => index < count, ellipsis)
        }
    })
}
export function async<T, Ellipsis = T>(this: AsyncIterable<T>, count: number, ellipsis?: Ellipsis) {
    mustBeInteger("count", count)
    const hasEllipsis = ellipsis !== undefined
    return asyncFromOperator("take", this, async function* (input) {
        if (count < 0) {
            count = -count
            let anySkipped = false
            const results = (await aseq(input)
                .append(END_MARKER)
                .window(
                    count + 1,
                    (...window) => {
                        if (window[window.length - 1] === END_MARKER) {
                            window.pop()
                            return window as T[]
                        }
                        anySkipped = true
                        return undefined
                    },
                    true
                )
                .filter(x => x !== undefined)
                .first()
                .pull()) as T[]
            if (anySkipped && hasEllipsis) {
                yield ellipsis as Ellipsis
            }
            yield* results
        } else {
            yield* aseq(input).takeWhile((_, index) => index < count, ellipsis)
        }
    })
}
