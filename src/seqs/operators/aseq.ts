import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

export function sync<T>(this: Iterable<T>): ASeq<T> {
    return aseq(this)
}
