import { mustBeInteger } from "../errors/error"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
import type { maybeDisjunction } from "../type-functions/maybe-disjunction"

const END_MARKER = Symbol("DUMMY")
export function sync<T, const Ellipsis = undefined>(
    this: Iterable<T>,
    count: number,
    ellipsis?: Ellipsis
): Seq<maybeDisjunction<T, Ellipsis>> {
    mustBeInteger("count", count)
    return syncFromOperator("take", this, function* (input) {
        if (count < 0) {
            count = -count
            let anySkipped = false
            const results = seq(input)
                .append(END_MARKER)
                .window(count + 1, (...window) => {
                    if (window[window.length - 1] === END_MARKER) {
                        window.pop()
                        return window as T[]
                    }
                    anySkipped = true
                    return undefined
                })
                .filter(x => x !== undefined)
                .first()
                .pull() as T[]
            if (anySkipped && ellipsis !== undefined) {
                yield ellipsis
            }
        } else {
            yield* seq(input).takeWhile((_, index) => index < count, ellipsis)
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
    return asyncFromOperator("take", this, async function* (input) {
        if (count < 0) {
            count = -count
            let anySkipped = false
            const results = (await aseq(input)
                .append(END_MARKER)
                .window(count + 1, (...window) => {
                    if (window[window.length - 1] === END_MARKER) {
                        window.pop()
                        return window as T[]
                    }
                    anySkipped = true
                    return undefined
                })
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
    }) as any
}
