import { aseq } from "../seq/aseq.js"
import type { ASeq } from "../seq/aseq.class.js"

export function sync<T>(this: Iterable<T>): ASeq<T> {
    return aseq(this)
}
