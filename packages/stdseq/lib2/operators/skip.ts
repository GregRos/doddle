import { mustBeInteger } from "../errors/error"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
import type { maybeDisjunction } from "../type-functions/maybe-disjunction"

export function sync<T, const Ellipsis = undefined>(
    this: Iterable<T>,
    count: number,
    ellipsis?: Ellipsis
): Seq<maybeDisjunction<T, Ellipsis>> {
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
    }) as any
}
export function async<T, const Ellipsis = undefined>(
    this: AsyncIterable<T>,
    count: number,
    ellipsis?: Ellipsis
): ASeq<maybeDisjunction<T, Ellipsis>> {
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
    }) as any
}
