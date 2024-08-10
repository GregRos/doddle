import { _aiter } from "../../utils.js"
import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

type neverToUndefined<T> = T extends never ? undefined : T
export type getZipValuesType<Xs extends [any, ...any[]]> = {
    [K in keyof Xs]: neverToUndefined<Xs[K]> | undefined
}
function zip<T, Xs extends [any, ...any[]]>(
    this: AsyncIterable<T>,
    others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    }
): ASeq<getZipValuesType<getZipValuesType<[T, ...Xs]>>>
function zip<T, Xs extends [any, ...any[]], R>(
    this: AsyncIterable<T>,
    _others: {
        [K in keyof Xs]: ASeq.SimpleInput<Xs[K]>
    },
    projection?: (...args: getZipValuesType<[T, ...Xs]>) => R | Promise<R>
): ASeq<R>
function zip<T, Xs extends [any, ...any[]], R>(
    this: AsyncIterable<T>,
    _others: {
        [K in keyof Xs]: ASeq.SimpleInput<Xs[K]>
    },
    projection?: (...args: getZipValuesType<[T, ...Xs]>) => R | Promise<R>
): ASeq<[T, ...Xs]> {
    const others = _others.map(aseq)
    projection ??= (...args: any[]) => args as any
    chk(zip).projection(projection)
    return ASeqOperator(this, async function* zip(input) {
        const iterators = [input, ...others].map(_aiter) as (AsyncIterator<any> | undefined)[]
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
export default zip
