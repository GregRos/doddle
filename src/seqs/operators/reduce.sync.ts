import generic from "./reduce.js"

import type { Lazy } from "../../lazy/index.js"

import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function reduce<Item>(this: Iterable<Item>, reducer: Seq.Reducer<Item, Item>): Lazy<Item>
function reduce<Item, Acc>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<Item, Acc>,
    initial: Acc
): Lazy<Acc>
function reduce<Item, Acc>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<Item, Acc>,
    initial?: Acc
): Lazy<any> {
    return generic(reduce, seq(this), reducer, initial) as any
}
export default reduce
