import type { Lazy, LazyAsync } from "../../lazy"
import { lazyFromOperator } from "../lazy-operator"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

export function sync<T extends S, S>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
export function sync<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
export function sync<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>) {
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
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
export function async<T, S extends T>(
    this: AsyncIterable<T>,
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
export function async<T>(this: AsyncIterable<T>, _other: ASeq.SimpleInput<T>) {
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
