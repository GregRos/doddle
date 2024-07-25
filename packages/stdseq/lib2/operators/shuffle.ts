import { aseq } from "../wrappers/aseq.ctor"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import { seq } from "../wrappers/seq.ctor"

export function sync<T>(this: Iterable<T>) {
    return syncFromOperator("shuffle", this, function* (input) {
        const array = seq(input).toArray().pull()
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
        yield* array
    })
}

export function async<T>(this: AsyncIterable<T>) {
    return asyncFromOperator("shuffle", this, async function* (input) {
        const array = await aseq(input).toArray().pull()
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
        yield* array
    })
}
