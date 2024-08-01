import { mustBeInteger } from "../errors/error"
import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
import type { maybeDisjunction } from "../type-functions/maybe-disjunction"

const SKIP = Symbol("SKIP")
export function sync<T, const Ellipsis = undefined>(
    this: Iterable<T>,
    countArg: number
): Seq<maybeDisjunction<T, Ellipsis>> {
    mustBeInteger("count", countArg)
    return new syncOperator("skip", this, function* (input) {
        let count = countArg
        if (count === 0) {
            yield* seq(input)
            return
        }
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
        } else {
            yield* seq(input).skipWhile((_, index) => index < count, {})
        }
    }) as any
}
export function async<T>(this: AsyncIterable<T>, countArg: number): ASeq<T> {
    mustBeInteger("count", countArg)
    return new asyncOperator("skip", this, async function* (input) {
        let count = countArg
        if (count === 0) {
            yield* aseq(input)
            return
        }
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
        } else {
            yield* aseq(input).skipWhile((_, index) => index < count, {})
        }
    }) as any
}
