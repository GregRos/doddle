import { mustBeFunction } from "../errors/error"
import { type AsyncPredicate, type Predicate } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import type { Lazy, LazyAsync } from "../lazy"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
const NO_MATCH = Symbol("NO_MATCH")
function generic<T>(input: Seq<T>, predicate: Predicate<T>): Lazy<boolean> {
    mustBeFunction("predicate", predicate)
    return lazyFromOperator("some", input, input => {
        return input
            .find(predicate, NO_MATCH)
            .map(x => x !== NO_MATCH)
            .pull()
    })
}

export function sync<T>(this: Iterable<T>, predicate: Predicate<T>): Lazy<boolean> {
    return generic(seq(this), predicate)
}
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>): LazyAsync<boolean> {
    return generic(aseq(this) as any, predicate as any) as any
}
