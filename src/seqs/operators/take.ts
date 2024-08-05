import { mustBeInteger } from "../../errors/error"
import { ASeqOperator } from "../seq/aseq.class"
import { SeqOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

const END_MARKER = Symbol("DUMMY")
export function sync<T>(this: Iterable<T>, countArg: number): Seq<T> {
    mustBeInteger("count", countArg)
    return new SeqOperator(this, function* take(input) {
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
export function async<T>(this: AsyncIterable<T>, countArg: number): ASeq<T> {
    mustBeInteger("count", countArg)
    return new ASeqOperator(this, async function* take(input) {
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
