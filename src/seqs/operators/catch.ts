import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

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
export function sync<T>(this: Iterable<T>, handler: Seq.Iteratee<Error, void>): Seq<T>
export function sync<T, S>(
    this: Iterable<T>,
    handler: Seq.Iteratee<Error, void | Seq.Input<S>>
): Seq<unknown> {
    return new syncOperator("catch", this, function* (input) {
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
            } catch (error) {
                if (typeof error !== "object" || !(error instanceof Error)) {
                    throw new ThrewNonError(error)
                }
                const result = handler(error, i)
                if (result == undefined) {
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
    handler: ASeq.Iteratee<Error, ASeq.SimpleInput<S>>
): ASeq<T | S>
export function async<T>(this: AsyncIterable<T>, handler: ASeq.Iteratee<Error, void>): ASeq<T>
export function async<T, S>(
    this: AsyncIterable<T>,
    handler: ASeq.Iteratee<Error, void | ASeq.SimpleInput<S>>
): ASeq<any> {
    return new asyncOperator("catch", this, async function* (input) {
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
            } catch (error) {
                if (typeof error !== "object" || !(error instanceof Error)) {
                    throw new ThrewNonError(error)
                }
                const result = await handler(error, i)
                if (result == undefined) {
                    return
                }
                yield* aseq(result)
                return
            }
            i++
        }
    })
}
