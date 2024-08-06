import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T>(count: number, projection: Seq.IndexIteratee<T>): Seq<T> {
    return seq(function* () {
        for (let i = 0; i < count; i++) {
            yield projection(i)
        }
    })
}

export function async<T>(count: number, projection: ASeq.IndexIteratee<T>): ASeq<T> {
    return aseq(async function* () {
        for (let i = 0; i < count; i++) {
            yield projection(i)
        }
    })
}
