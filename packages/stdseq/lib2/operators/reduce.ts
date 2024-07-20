import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type Reducer, type AsyncReducer } from "../f-types/index"
import _scan from "./scan"
import _last from "./last"
import { lazy, type Lazy, type LazyAsync } from "stdlazy/lib"
import { aseq, seq } from "../ctors"

const _reduce = new (class reduce {
    name = "reduce"
    sync<Item>(this: Iterable<Item>, reducer: Reducer<Item, Item>): Lazy<Item>
    sync<Item, Acc>(this: Iterable<Item>, reducer: Reducer<Item, Acc>, initial: Acc): Lazy<Acc>
    sync<Item, Acc>(this: Iterable<Item>, reducer: Reducer<Item, Acc>, initial?: Acc): Lazy<any> {
        return lazyFromOperator(_reduce, this, input => {
            return seq(input).scan(reducer, initial!).last()
        })
    }

    async<Item>(this: AsyncIterable<Item>, reducer: AsyncReducer<Item, Item>): LazyAsync<Item>
    async<Item, Acc>(
        this: AsyncIterable<Item>,
        reducer: AsyncReducer<Item, Acc>,
        initial: Acc
    ): LazyAsync<Acc>
    async<Item, Acc>(
        this: AsyncIterable<Item>,
        reducer: AsyncReducer<Item, Acc>,
        initial?: Acc
    ): any {
        return lazyFromOperator(_reduce, this, async input => {
            return await aseq(input).scan(reducer, initial!).last().pull()
        })
    }
})()

export default _reduce
