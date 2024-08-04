import { mustBeFunction } from "../../errors/error"
import { lazyFromOperator } from "../from/operator"
import type { Lazy, LazyAsync } from "../../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

function generic<T>(input: Seq<T>, predicate?: Seq.Predicate<T>): Lazy<number> {
    predicate && mustBeFunction("predicate", predicate)
    return lazyFromOperator("count", input, input => {
        return input
            .filter(predicate ?? (() => true))
            .reduce(acc => acc + 1, 0)
            .pull()
    })
}

export function sync<T>(this: Iterable<T>, predicate?: Seq.Predicate<T>): Lazy<number> {
    return generic(seq(this), predicate)
}
export function async<T>(this: AsyncIterable<T>, predicate?: ASeq.Predicate<T>): LazyAsync<number> {
    return generic(aseq(this) as any, predicate as any) as any
}
