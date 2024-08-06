import type { ASeq } from "../seq/aseq.class"
import { ASeqOperator } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { SeqOperator } from "../seq/seq.class"

import { mustBeFunction } from "../../errors/error"
import { isThenable } from "../../utils"
import { seq } from "../seq/seq.ctor"

class ThrewNonError<T> extends Error {
    constructor(public value: T) {
        super(`An iterable threw a non-error value of type ${typeof value}: ${value}`)
    }
}

export function sync<T, S>(
    this: Iterable<T>,
    handler: Seq.Iteratee<Error, Seq.Input<S>>
): Seq<T | S>
export function sync<T>(this: Iterable<T>, handler: Seq.Iteratee<Error, void | undefined>): Seq<T>
export function sync<T, S>(
    this: Iterable<T>,
    handler: Seq.Iteratee<Error, void | Seq.Input<S>>
): Seq<unknown> {
    mustBeFunction("handler", handler)
    return new SeqOperator(this, function* catch_(input) {
        let i = 0
        const iterator = input[Symbol.iterator]()
        for (;;) {
            try {
                const result = iterator.next()
                var value = result.value
                if (result.done) {
                    return
                }
                yield value
            } catch (err: any) {
                let error = err
                if (typeof error !== "object" || !(error instanceof Error)) {
                    error = new ThrewNonError(error)
                }
                const result = handler(error, i)
                if (result == null) {
                    return
                }
                if (isThenable(result)) {
                    throw TypeError(
                        "Unexpected promise or thenable returned from sync catch handler."
                    )
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
    handler: ASeq.Iteratee<Error, ASeq.SimpleInput<S>>
): ASeq<T | S>
export function async<T>(this: AsyncIterable<T>, handler: ASeq.Iteratee<Error, void>): ASeq<T>
export function async<T, S>(
    this: AsyncIterable<T>,
    handler: ASeq.Iteratee<Error, void | ASeq.SimpleInput<S>>
): ASeq<any> {
    return new ASeqOperator(this, async function* catch_(input) {
        let i = 0
        const iterator = input[Symbol.asyncIterator]()
        for (;;) {
            try {
                const result = await iterator.next()
                var value = result.value
                if (result.done) {
                    return
                }
                yield value
            } catch (err: any) {
                let error = err
                if (typeof error !== "object" || !(error instanceof Error)) {
                    error = new ThrewNonError(error)
                }
                const result = await handler(error, i)
                if (result == null) {
                    return
                }
                yield* aseq(result)
                return
            }
            i++
        }
    })
}
