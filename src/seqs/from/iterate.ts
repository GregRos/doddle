import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

export function sync<T>(iteratee: Seq.IndexIteratee<T>, count: number): Seq<T> {
    return seq(function* () {
        for (let i = 0; i < count; i++) {
            yield iteratee(i)
        }
    })
}

export function async<T>(iteratee: Seq.IndexIteratee<T>, count: number): ASeq<T> {
    return aseq(sync(iteratee, count))
}
