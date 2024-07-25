import type { ASeq } from "../wrappers/aseq.class"
import { fromAsyncInput } from "../from/input"

export function sync<T>(this: Iterable<T>): ASeq<T> {
    return fromAsyncInput(this)
}
