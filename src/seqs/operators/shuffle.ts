import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { SeqOperator } from "../seq/seq.class.js"

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
export function sync<T>(this: Iterable<T>) {
    return new SeqOperator(this, function* shuffle(input) {
        const array = seq(input).toArray().pull()
        shuffleArray(array)
        yield* array
    })
}

export function async<T>(this: AsyncIterable<T>) {
    return new ASeqOperator(this, async function* shuffle(input) {
        const array = await aseq(input).toArray().pull()
        shuffleArray(array)
        yield* array
    })
}
