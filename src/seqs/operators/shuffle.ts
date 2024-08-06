import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}
function compute<T>(input: Seq<T>): any {
    return input
        .toArray()
        .map(x => shuffleArray(x))
        .pull()
}
export function sync<T>(this: Iterable<T>): Seq<T> {
    return SeqOperator(this, function* shuffle(input) {
        yield* compute(seq(input))
    })
}

export function async<T>(this: AsyncIterable<T>): ASeq<T> {
    return ASeqOperator(this, async function* shuffle(input) {
        yield* await compute(aseq(input) as any)
    }) as any
}
