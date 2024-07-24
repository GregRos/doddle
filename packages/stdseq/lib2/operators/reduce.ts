import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type Reducer, type AsyncReducer } from "../f-types/index"

import { lazy, type Lazy, type LazyAsync } from "stdlazy/lib"
import { seq } from "../seq"
import { aseq } from "../aseq"
import { mustBeFunction } from "../errors/error"

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
    mustBeFunction("reducer", reducer)
    return lazyFromOperator("reduce", this, input => {
        return seq(input).scan(reducer, initial!).last()
    })
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
    mustBeFunction("reducer", reducer)
    return lazyFromOperator("reduce", this, async input => {
        return await aseq(input).scan(reducer, initial!).last().pull()
    })
}
