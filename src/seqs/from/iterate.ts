import { aseq } from "../seq/aseq.js"
import type { ASeq } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T>(count: number, iteratee: Seq.IndexIteratee<T>): Seq<T> {
    return seq(function* () {
        for (let i = 0; i < count; i++) {
            yield iteratee(i)
        }
    })
}

export function async<T>(count: number, iteratee: ASeq.IndexIteratee<T>): ASeq<T> {
    return aseq(async function* () {
        for (let i = 0; i < count; i++) {
            yield iteratee(i)
        }
    })
}
