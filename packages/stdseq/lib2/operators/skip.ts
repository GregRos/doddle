import { mustBeInteger } from "../errors/error"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
import type { maybeDisjunction } from "../type-functions/maybe-disjunction"

const SKIP = Symbol("SKIP")
export function sync<T, const Ellipsis = undefined>(
    this: Iterable<T>,
    countArg: number,
    ellipsis?: Ellipsis
): Seq<maybeDisjunction<T, Ellipsis>> {
    mustBeInteger("count", countArg)
    const hasEllipsis = ellipsis !== undefined
    return syncFromOperator("skip", this, function* (input) {
        let count = countArg
        if (count < 0) {
            count = -count
            yield* seq(input)
                .window(count + 1, (...window) => {
                    if (window.length === count + 1) {
                        return window[0]
                    }
                    return SKIP
                })
                .filter(x => x !== SKIP)
            if (hasEllipsis) {
                yield ellipsis as Ellipsis
            }
        } else {
            yield* seq(input).skipWhile((_, index) => index < count, ellipsis)
        }
    }) as any
}
export function async<T, const Ellipsis = undefined>(
    this: AsyncIterable<T>,
    countArg: number,
    ellipsis?: Ellipsis
): ASeq<maybeDisjunction<T, Ellipsis>> {
    mustBeInteger("count", countArg)
    const hasEllipsis = ellipsis !== undefined
    return asyncFromOperator("skip", this, async function* (input) {
        let count = countArg
        if (count < 0) {
            count = -count
            yield* aseq(input)
                .window(count + 1, (...window) => {
                    if (window.length === count + 1) {
                        return window[0]
                    }
                    return SKIP
                })
                .filter(x => x !== SKIP)
            if (hasEllipsis) {
                yield ellipsis as Ellipsis
            }
        } else {
            yield* aseq(input).skipWhile((_, index) => index < count, ellipsis)
        }
    }) as any
}
