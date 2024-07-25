import type { ASeq } from "../wrappers/aseq.class"
import type { Seq } from "../wrappers/seq.class"
import { fromAsyncInput, fromSyncInput } from "./input"

export function sync<T>(...items: T[]): Seq<T> {
    return fromSyncInput(items)
}

export function async<T>(...items: T[]): ASeq<T> {
    return fromAsyncInput(items)
}
