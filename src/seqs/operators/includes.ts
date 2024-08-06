import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function generic<T>(input: Seq<T>, value: T) {
    return lazyFromOperator("includes", input, input => {
        return input.some(element => element === value).pull()
    })
}

export function sync<T>(this: Iterable<T>, value: T): Lazy<boolean> {
    return generic(seq(this), value)
}
export function async<T>(this: AsyncIterable<T>, value: T): LazyAsync<boolean> {
    return generic(aseq(this) as any, value) as any
}
