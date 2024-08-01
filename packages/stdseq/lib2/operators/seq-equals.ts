import type { Lazy, LazyAsync } from "stdlazy"
import { type ASeqLikeInput, type SeqLikeInput } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import { seq } from "../seq/seq.ctor"

export function sync<T extends S, S>(this: Iterable<T>, _other: SeqLikeInput<S>): Lazy<boolean>
export function sync<T, S extends T>(this: Iterable<T>, _other: SeqLikeInput<S>): Lazy<boolean>
export function sync<T, S extends T>(this: Iterable<T>, _other: SeqLikeInput<S>) {
    const other = seq(_other)
    return lazyFromOperator("seqEquals", this, input => {
        const otherIterator = other[Symbol.iterator]()
        for (const element of input) {
            const otherElement = otherIterator.next()
            if (otherElement.done || element !== otherElement.value) {
                return false
            }
        }
        return !!otherIterator.next().done
    })
}

export function async<T extends S, S>(
    this: AsyncIterable<T>,
    _other: ASeqLikeInput<S>
): LazyAsync<boolean>
export function async<T, S extends T>(
    this: AsyncIterable<T>,
    _other: ASeqLikeInput<S>
): LazyAsync<boolean>
export function async<T>(this: AsyncIterable<T>, _other: ASeqLikeInput<T>) {
    const other = aseq(_other)
    return lazyFromOperator("seqEquals", this, async input => {
        const otherIterator = other[Symbol.asyncIterator]()
        for await (const element of input) {
            const otherElement = await otherIterator.next()
            if (otherElement.done || element !== otherElement.value) {
                return false
            }
        }
        return !!(await otherIterator.next()).done
    })
}
