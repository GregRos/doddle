import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

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
