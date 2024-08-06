import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T>(...items: T[]): Seq<T> {
    return seq(items)
}

export function async<T>(...items: T[]): ASeq<T> {
    return aseq(items)
}
