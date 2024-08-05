import { ASeqOperator } from "../seq/aseq.class"
import { SeqOperator } from "../seq/seq.class"
import { aseq } from "../seq/aseq.ctor"

import { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>) {
    return new SeqOperator("uniq", this, function* (input) {
        yield* seq(input).uniqBy(x => x)
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return new ASeqOperator("uniq", this, async function* (input) {
        yield* aseq(input).uniqBy(x => x)
    })
}
