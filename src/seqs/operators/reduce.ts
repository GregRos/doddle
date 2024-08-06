import { lazyFromOperator } from "../lazy-operator.js"

import type { Lazy, LazyAsync } from "../../lazy/index.js"

import { mustBeFunction } from "../../errors/error.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import type { ASeq } from "../seq/aseq.class.js"
import { seq } from "../seq/seq.js"
const NO_INITIAL = Symbol("NO_INTIAL")

export function generic<Item, Acc>(
    input: Seq<Item>,
    reducer: Seq.Reducer<Item, Acc>,
    initial?: Acc
): Lazy<any> {
    mustBeFunction("reducer", reducer)
    return lazyFromOperator(input, function reduce(input) {
        return input
            .scan(reducer, initial!)
            .last(NO_INITIAL)
            .map(x => {
                if (x === NO_INITIAL) {
                    throw new Error("Cannot reduce empty sequence with no initial value")
                }
                return x
            })
            .pull()
    }) as any
}
export function sync<Item>(this: Iterable<Item>, reducer: Seq.Reducer<Item, Item>): Lazy<Item>
export function sync<Item, Acc>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<Item, Acc>,
    initial: Acc
): Lazy<Acc>
export function sync<Item, Acc>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<Item, Acc>,
    initial?: Acc
): Lazy<any> {
    return generic(seq(this), reducer, initial) as any
}

export function async<Item>(
    this: AsyncIterable<Item>,
    reducer: ASeq.Reducer<Item, Item>
): LazyAsync<Item>
export function async<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: ASeq.Reducer<Item, Acc>,
    initial: Acc
): LazyAsync<Acc>
export function async<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: ASeq.Reducer<Item, Acc>,
    initial?: Acc
): any {
    return generic(aseq(this) as any, reducer as any, initial) as any
}
