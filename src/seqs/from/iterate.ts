import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

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
