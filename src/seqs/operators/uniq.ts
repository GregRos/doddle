import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

export function sync<T>(this: Iterable<T>) {
    return new SeqOperator(this, function* uniq(input) {
        yield* seq(input).uniqBy(x => x)
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return new ASeqOperator(this, async function* uniq(input) {
        yield* aseq(input).uniqBy(x => x)
    })
}
