import type { ASeq } from "../aseq"
import type { Seq } from "../seq"
import { fromAsyncInput, fromSyncInput } from "./input"

export function sync<T>(value: T, times: number): Seq<T> {
    return fromSyncInput(function* () {
        for (let i = 0; i < times; i++) {
            yield value
        }
    })
}

export function async<T>(value: T, times: number): ASeq<T> {
    return fromAsyncInput(sync(value, times))
}
