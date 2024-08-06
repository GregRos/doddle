import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { aseq } from "../seq/aseq.js"
import type { ASeq } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T extends S, S>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
export function sync<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
export function sync<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>) {
    const other = seq(_other)
    return lazyFromOperator("setEquals", this, input => {
        const set = new Set(other) as Set<any>
        for (const element of input) {
            if (!set.delete(element)) {
                return false
            }
        }
        return set.size === 0
    })
}

export function async<T, S extends T>(
    this: AsyncIterable<T>,
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
export function async<T extends S, S>(
    this: AsyncIterable<T>,
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
export function async<T, S>(this: AsyncIterable<T>, _other: ASeq.SimpleInput<S>) {
    const other = aseq(_other)
    return lazyFromOperator("setEquals", this, async input => {
        const set = new Set<T>() as Set<any>
        for await (const element of other) {
            set.add(element)
        }
        for await (const element of input) {
            if (!set.delete(element)) {
                return false
            }
        }
        return set.size === 0
    })
}
