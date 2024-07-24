import type { ASeq } from "../aseq"
import type { Seq } from "../seq"
import { fromAsyncInput, fromSyncInput } from "./input"

export function sync<T>(f: () => T, count: number): Seq<T> {
    return fromSyncInput(function* () {
        for (let i = 0; i < count; i++) {
            yield f()
        }
    })
}

export function async<T>(f: () => T, count: number): ASeq<T> {
    return fromAsyncInput(sync(f, count))
}
