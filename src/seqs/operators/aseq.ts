import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

export function sync<T>(this: Iterable<T>): ASeq<T> {
    return aseq(this)
}
