import { aseq } from "../seq/aseq"
import { ASeqOperator } from "../seq/aseq.class"
import { SeqOperator } from "../seq/seq.class"

import { seq } from "../seq/seq"

export function sync<T>(this: Iterable<T>) {
    return new SeqOperator(this, function* reverse(input) {
        yield* seq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return new ASeqOperator(this, async function* reverse(input) {
        yield* await aseq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
