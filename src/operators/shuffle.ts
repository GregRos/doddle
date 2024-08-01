import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import { aseq } from "../seq/aseq.ctor"

import { seq } from "../seq/seq.ctor"

function shuffle<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}
export function sync<T>(this: Iterable<T>) {
    return new syncOperator("shuffle", this, function* (input) {
        const array = seq(input).toArray().pull()
        shuffle(array)
        yield* array
    })
}

export function async<T>(this: AsyncIterable<T>) {
    return new asyncOperator("shuffle", this, async function* (input) {
        const array = await aseq(input).toArray().pull()
        shuffle(array)
        yield* array
    })
}
