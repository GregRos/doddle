import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

function generic<T>(caller: any, input: Seq<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    predicate = chk(caller).predicate(predicate)
    return lazyFromOperator(input, function every(input) {
        return input
            .map(predicate)
            .some(x => !x)
            .pull()
    }).map(x => !x)
}

export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    return generic(sync, seq(this), predicate)
}
export function async<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): LazyAsync<boolean> {
    return generic(async, aseq(this) as any, predicate as any) as any
}
