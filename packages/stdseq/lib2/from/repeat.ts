import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

export function sync<T>(value: T, times: number): Seq<T> {
    return seq(function* () {
        for (let i = 0; i < times; i++) {
            yield value
        }
    })
}

export function async<T>(value: T, times: number): ASeq<T> {
    return aseq(sync(value, times))
}
