import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { _aiter, _iter } from "../../utils.js"
import { chk } from "../seq/_seq.js"
import { seq } from "../seq/seq.js"

export function sync<T, S>(
    this: Iterable<T>,
    handler: Seq.Iteratee<unknown, Seq.Input<S>>
): Seq<T | S>
export function sync<T>(this: Iterable<T>, handler: Seq.Iteratee<unknown, void | undefined>): Seq<T>
export function sync<T, S>(
    this: Iterable<T>,
    handler: Seq.Iteratee<unknown, void | Seq.Input<S>>
): Seq<unknown> {
    chk(sync).handler(handler)
    return SeqOperator(this, function* catch_(input) {
        let i = 0
        const iterator = _iter(input)
        for (;;) {
            try {
                const result = iterator.next()
                var value = result.value
                if (result.done) {
                    return
                }
                yield value
            } catch (err: any) {
                const error = err
                const result = handler(error, i)
                if (!result || result == null) {
                    return
                }
                yield* seq(result)
                return
            }
            i++
        }
    })
}

export function async<T, S>(
    this: AsyncIterable<T>,
    handler: ASeq.Iteratee<unknown, ASeq.SimpleInput<S>>
): ASeq<T | S>
export function async<T>(this: AsyncIterable<T>, handler: ASeq.Iteratee<unknown, void>): ASeq<T>
export function async<T, S>(
    this: AsyncIterable<T>,
    handler: ASeq.Iteratee<unknown, void | ASeq.SimpleInput<S>>
): ASeq<any> {
    chk(async).handler(handler)
    return ASeqOperator(this, async function* catch_(input) {
        let i = 0
        const iterator = _aiter(input)
        for (;;) {
            try {
                const result = await iterator.next()
                var value = result.value
                if (result.done) {
                    return
                }
                yield value
            } catch (err: any) {
                const error = err
                const result = await handler(error, i)
                if (!result || result == null) {
                    return
                }
                yield* aseq(result)
                return
            }
            i++
        }
    })
}
