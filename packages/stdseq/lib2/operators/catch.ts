import type { ASeqLikeInput, AsyncIteratee, Iteratee, SeqLikeInput } from "../f-types"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

class ThrewNonError<T> extends Error {
    constructor(public value: T) {
        super(`An iterable threw a non-error value of type ${typeof value}: ${value}`)
    }
}

export function sync<T, S>(this: Iterable<T>, handler: Iteratee<Error, SeqLikeInput<S>>): Seq<T | S>
export function sync<T>(this: Iterable<T>, handler: Iteratee<Error, void>): Seq<T>
export function sync<T, S>(
    this: Iterable<T>,
    handler: Iteratee<Error, void | SeqLikeInput<S>>
): Seq<unknown> {
    return syncFromOperator("catch", this, function* (input) {
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
    handler: AsyncIteratee<Error, ASeqLikeInput<S>>
): ASeq<T | S>
export function async<T>(this: AsyncIterable<T>, handler: AsyncIteratee<Error, void>): ASeq<T>
export function async<T, S>(
    this: AsyncIterable<T>,
    handler: AsyncIteratee<Error, void | ASeqLikeInput<S>>
): ASeq<any> {
    return asyncFromOperator("catch", this, async function* (input) {
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
