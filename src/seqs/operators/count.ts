import { mustBeFunction } from "../../errors/error"
import type { Lazy, LazyAsync } from "../../lazy"
import { lazyFromOperator } from "../lazy-operator"
import { aseq } from "../seq/aseq"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq"

function generic<T>(input: Seq<T>, predicate?: Seq.Predicate<T>): Lazy<number> {
    if (predicate) {
        mustBeFunction("predicate", predicate)
    }
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
