import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

export function sync<T>(f: () => T, count: number): Seq<T> {
    return seq(function* () {
        for (let i = 0; i < count; i++) {
            yield f()
        }
    })
}

export function async<T>(f: () => T, count: number): ASeq<T> {
    return aseq(sync(f, count))
}
