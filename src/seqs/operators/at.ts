import { mustBeInteger } from "../../errors/error.js"
import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function generic<T>(input: Seq<T>, index: number): Lazy<T | undefined> {
    mustBeInteger("index", index)

    return lazyFromOperator(input, function at(input) {
        if (index < 0) {
            return input.take(index).first().pull()
        }
        return input.skip(index).first().pull()
    })
}

export function sync<T>(this: Iterable<T>, index: number): Lazy<T | undefined> {
    return generic(seq(this), index) as any
}
export function async<T>(this: AsyncIterable<T>, index: number): LazyAsync<T | undefined> {
    return generic(aseq(this) as any, index) as any
}
