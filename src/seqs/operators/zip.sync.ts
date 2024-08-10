import { _iter } from "../../utils.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

type neverToUndefined<T> = T extends never ? undefined : T
export type getZipValuesType<Xs extends [any, ...any[]]> = {
    [K in keyof Xs]: neverToUndefined<Xs[K]> | undefined
}
function zip<T, Xs extends [any, ...any[]]>(
    this: Iterable<T>,
    others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    }
): Seq<getZipValuesType<[T, ...Xs]>>
function zip<T, Xs extends [any, ...any[]], R>(
    this: Iterable<T>,
    others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    },
    projection: (...args: getZipValuesType<[T, ...Xs]>) => R
): Seq<R>
function zip<T, Xs extends [any, ...any[]], R>(
    this: Iterable<T>,
    _others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    },
    projection?: (...args: getZipValuesType<[T, ...Xs]>) => R
): Seq<[T, ...Xs]> {
    const others = _others.map(seq)
    projection ??= (...args: any[]) => args as any
    chk(zip).projection(projection)
    return SeqOperator(this, function* zip(input) {
        const iterators = [input, ...others].map(_iter) as (Iterator<any> | undefined)[]
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
export default zip
