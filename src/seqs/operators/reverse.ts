import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T>(this: Iterable<T>) {
    return SeqOperator(this, function* reverse(input) {
        yield* seq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return ASeqOperator(this, async function* reverse(input) {
        yield* await aseq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
