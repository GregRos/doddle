import { type AsyncReducer, type Reducer } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"

import { type Lazy, type LazyAsync } from "stdlazy"
import { mustBeFunction } from "../errors/error"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
import { UNSET } from "../special/tokens"

export function generic<Item, Acc>(
    input: Seq<Item>,
    reducer: Reducer<Item, Acc>,
    initial?: Acc
): Lazy<any> {
    mustBeFunction("reducer", reducer)
    return lazyFromOperator("reduce", input, input => {
        return input
            .scan(reducer, initial!)
            .last(UNSET)
            .map(x => {
                if (x === UNSET) {
                    throw new Error("Cannot reduce empty sequence with no initial value")
                }
                return x
            })
            .pull()
    }) as any
}
export function sync<Item>(this: Iterable<Item>, reducer: Reducer<Item, Item>): Lazy<Item>
export function sync<Item, Acc>(
    this: Iterable<Item>,
    reducer: Reducer<Item, Acc>,
    initial: Acc
): Lazy<Acc>
export function sync<Item, Acc>(
    this: Iterable<Item>,
    reducer: Reducer<Item, Acc>,
    initial?: Acc
): Lazy<any> {
    return generic(seq(this), reducer, initial) as any
}

export function async<Item>(
    this: AsyncIterable<Item>,
    reducer: AsyncReducer<Item, Item>
): LazyAsync<Item>
export function async<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: AsyncReducer<Item, Acc>,
    initial: Acc
): LazyAsync<Acc>
export function async<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: AsyncReducer<Item, Acc>,
    initial?: Acc
): any {
    return generic(aseq(this) as any, reducer as any, initial) as any
}
