import type { ASeq } from "../aseq"
import { fromAsyncInput } from "../from/input"

export function sync<T>(this: Iterable<T>): ASeq<T> {
    return fromAsyncInput(this)
}
