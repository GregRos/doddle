import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

export function sync<T>(...items: T[]): Seq<T> {
    return seq(items)
}

export function async<T>(...items: T[]): ASeq<T> {
    return aseq(items)
}
