import { checkCount } from "../../errors/error.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

const END_MARKER = Symbol("DUMMY")

export function compute<T>(input: Seq<T>, count: number): any {
    if (count === 0) {
        return []
    }
    if (count < 0) {
        count = -count
        return input
            .append(END_MARKER)
            .window(count + 1, (...window) => {
                if (window[window.length - 1] === END_MARKER) {
                    window.pop()
                    return window
                }
                return undefined
            })
            .filter(x => x !== undefined)
            .first()
            .pull() as T[]
    }
    return input.takeWhile((_, index) => index < count - 1, {
        takeFinal: true
    })
}

export function sync<T>(this: Iterable<T>, count: number): Seq<T> {
    checkCount(count)
    return SeqOperator(this, function* take(input) {
        yield* compute(seq(input), count)
    }) as any
}
export function async<T>(this: AsyncIterable<T>, count: number): ASeq<T> {
    checkCount(count)
    return ASeqOperator(this, async function* take(input) {
        yield* await compute(aseq(input) as any, count)
    }) as any
}
