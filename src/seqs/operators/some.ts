import { mustBeFunction } from "../../errors/error"
import { lazyFromOperator } from "../from/operator"
import type { Lazy, LazyAsync } from "../../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
const NO_MATCH = Symbol("NO_MATCH")
function generic<T>(input: Seq<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("some", input, input => {
        return input
            .find(predicate, NO_MATCH)
            .map(x => x !== NO_MATCH)
            .pull()
    })
}

export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    return generic(seq(this), predicate)
}
export function async<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): LazyAsync<boolean> {
    return generic(aseq(this) as any, predicate as any) as any
}
