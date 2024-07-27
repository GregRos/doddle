import { asyncFromOperator, syncFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>, length: number) {
    return syncFromOperator("sample", this, function* (input) {
        yield* seq(input).shuffle().take(length)
    })
}

export function async<T>(this: AsyncIterable<T>, length: number) {
    return asyncFromOperator("sample", this, async function* (input) {
        yield* aseq(input).shuffle().take(length)
    })
}
