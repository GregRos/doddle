import generic from "./reduce.js"

import type { LazyAsync } from "../../lazy/index.js"

import { aseq } from "../seq/aseq.js"

import type { ASeq } from "../seq/aseq.class.js"

function reduce<Item>(this: AsyncIterable<Item>, reducer: ASeq.Reducer<Item, Item>): LazyAsync<Item>
function reduce<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: ASeq.Reducer<Item, Acc>,
    initial: Acc
): LazyAsync<Acc>
function reduce<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: ASeq.Reducer<Item, Acc>,
    initial?: Acc
): any {
    return generic(reduce, aseq(this) as any, reducer as any, initial) as any
}
export default reduce
