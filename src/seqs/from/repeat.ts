import { aseq } from "../seq/aseq"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq"

export function sync<T>(times: number, value: T): Seq<T> {
    return seq(function* () {
        for (let i = 0; i < times; i++) {
            yield value
        }
    })
}

export function async<T>(times: number, value: T): ASeq<T> {
    return aseq(sync(times, value))
}
