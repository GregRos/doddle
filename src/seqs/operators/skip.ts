import { mustBeInteger } from "../../errors/error.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

const SKIP = Symbol("SKIP")
export function sync<T>(this: Iterable<T>, countArg: number): Seq<T> {
    mustBeInteger("count", countArg)
    return SeqOperator(this, function* skip(input) {
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
    return new ASeqOperator(this, async function* skip(input) {
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
