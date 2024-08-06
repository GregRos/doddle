import { aseq } from "../seq/aseq"
import type { ASeq } from "../seq/aseq.class"

export function sync<T>(this: Iterable<T>): ASeq<T> {
    return aseq(this)
}
