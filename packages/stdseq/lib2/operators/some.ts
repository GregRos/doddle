import type { Lazy, LazyAsync } from "stdlazy"
import { mustBeFunction } from "../errors/error"
import { type AsyncPredicate, type Predicate } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

function generic<T>(input: Seq<T>, predicate: Predicate<T>): Lazy<boolean> {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("some", input, input => {
        const unset = {} as any
        return input
            .find(predicate, unset)
            .map(x => x !== unset)
            .pull()
    })
}

export function sync<T>(this: Iterable<T>, predicate: Predicate<T>): Lazy<boolean> {
    return generic(seq(this), predicate)
}
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>): LazyAsync<boolean> {
    return generic(aseq(this) as any, predicate as any) as any
}
