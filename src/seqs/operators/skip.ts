import { checkCount } from "../../errors/error.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

const SKIP = Symbol("SKIP")

export function compute<T>(input: Seq<T>, count: number) {
    if (count === 0) {
        return input
    }
    if (count < 0) {
        count = -count
        return input
            .window(count + 1, (...window) => {
                if (window.length === count + 1) {
                    return window[0]
                }
                return SKIP
            })
            .filter(x => x !== SKIP)
    }
    return input.skipWhile((_, index) => index < count)
}
export function sync<T>(this: Iterable<T>, count: number): Seq<T> {
    checkCount(count)
    return SeqOperator(this, function* skip(input) {
        yield* compute(seq(input), count)
    }) as any
}
export function async<T>(this: AsyncIterable<T>, count: number): ASeq<T> {
    checkCount(count)
    return ASeqOperator(this, async function* skip(input) {
        yield* compute(aseq(input) as any, count)
    }) as any
}
