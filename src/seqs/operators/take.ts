import { mustBeInteger } from "../../errors/error"
import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
import type { maybeDisjunction } from "../type-functions/maybe-disjunction"

const END_MARKER = Symbol("DUMMY")
export function sync<T, const Ellipsis = undefined>(
    this: Iterable<T>,
    countArg: number
): Seq<maybeDisjunction<T, Ellipsis>> {
    mustBeInteger("count", countArg)
    return new syncOperator("take", this, function* (input) {
        let count = countArg
        if (count === 0) {
            yield* []
            return
        }
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

            yield* results
        } else {
            yield* seq(input).takeWhile((_, index) => index < count - 1, {
                takeFinal: true
            })
        }
    }) as any
}
export function async<T, const Ellipsis = undefined>(
    this: AsyncIterable<T>,
    countArg: number
): ASeq<maybeDisjunction<T, Ellipsis>> {
    mustBeInteger("count", countArg)
    return new asyncOperator("take", this, async function* (input) {
        let count = countArg
        if (count === 0) {
            yield* []
            return
        }
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
            yield* results
        } else {
            yield* aseq(input).takeWhile((_, index) => index < count - 1, {
                takeFinal: true
            })
        }
    }) as any
}
