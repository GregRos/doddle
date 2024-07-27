import { fromAsyncInput } from "../from/input"
import type { ASeq } from "../seq/aseq.class"

export function sync<T>(this: Iterable<T>): ASeq<T> {
    return fromAsyncInput(this)
}
