import { mustBeFunction } from "../../errors/error.js"
import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

function generic<T>(input: Seq<T>, predicate?: Seq.Predicate<T>): Lazy<number> {
    if (predicate) {
        mustBeFunction("predicate", predicate)
    }
    return lazyFromOperator(input, function count(input) {
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
