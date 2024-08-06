import { mustBeInteger } from "../../errors/error.js"
import { aseq } from "../seq/aseq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

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
            const results = seq(input)
                .append(END_MARKER)
                .window(count + 1, (...window) => {
                    if (window[window.length - 1] === END_MARKER) {
                        window.pop()
                        return window as T[]
                    }
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
            const results = (await aseq(input)
                .append(END_MARKER)
                .window(count + 1, (...window) => {
                    if (window[window.length - 1] === END_MARKER) {
                        window.pop()
                        return window as T[]
                    }
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
