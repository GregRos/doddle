import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

type neverToUndefined<T> = T extends never ? undefined : T
export type getZipValuesType<Xs extends [any, ...any[]]> = {
    [K in keyof Xs]: neverToUndefined<Xs[K]> | undefined
}

export function sync<T, Xs extends [any, ...any[]]>(
    this: Iterable<T>,
    others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    }
): Seq<getZipValuesType<[T, ...Xs]>>
export function sync<T, Xs extends [any, ...any[]], R>(
    this: Iterable<T>,
    others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    },
    projection: (...args: getZipValuesType<[T, ...Xs]>) => R
): Seq<R>
export function sync<T, Xs extends [any, ...any[]], R>(
    this: Iterable<T>,
    _others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    },
    projection?: (...args: getZipValuesType<[T, ...Xs]>) => R
): Seq<[T, ...Xs]> {
    const others = _others.map(seq)
    projection ??= (...args: any[]) => args as any
    return new SeqOperator(this, function* zip(input) {
        const iterators = [input, ...others].map(
            i => i[Symbol.iterator]() as Iterator<any> | undefined
        )
        while (true) {
            const results = iterators.map((iter, i) => {
                if (!iter) {
                    return undefined
                }
                const result = iter.next()
                if (result.done) {
                    iterators[i] = undefined
                    return undefined
                }
                return result
            })
            if (results.every(r => !r)) {
                break
            }
            yield projection.apply(undefined, results.map(r => r?.value) as any)
        }
    }) as any
}
export function async<T, Xs extends [any, ...any[]]>(
    this: AsyncIterable<T>,
    others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    }
): ASeq<getZipValuesType<getZipValuesType<[T, ...Xs]>>>
export function async<T, Xs extends [any, ...any[]], R>(
    this: AsyncIterable<T>,
    _others: {
        [K in keyof Xs]: ASeq.SimpleInput<Xs[K]>
    },
    projection?: (...args: getZipValuesType<[T, ...Xs]>) => R | Promise<R>
): ASeq<R>
export function async<T, Xs extends [any, ...any[]], R>(
    this: AsyncIterable<T>,
    _others: {
        [K in keyof Xs]: ASeq.SimpleInput<Xs[K]>
    },
    projection?: (...args: getZipValuesType<[T, ...Xs]>) => R | Promise<R>
): ASeq<[T, ...Xs]> {
    const others = _others.map(aseq)
    projection ??= (...args: any[]) => args as any
    return new ASeqOperator(this, async function* zip(input) {
        const iterators = [input, ...others].map(
            i => i[Symbol.asyncIterator]() as AsyncIterator<any> | undefined
        )
        while (true) {
            const pResults = iterators.map(async (iter, i) => {
                if (!iter) {
                    return undefined
                }
                const result = await iter.next()
                if (result.done) {
                    iterators[i] = undefined
                    return undefined
                }
                return result
            })
            const results = await Promise.all(pResults)
            if (results.every(r => !r)) {
                break
            }
            yield projection.apply(undefined, results.map(r => r?.value) as any)
        }
    }) as any
}
