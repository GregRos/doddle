import { lazyFromOperator, syncFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>) {
    return syncFromOperator("reverse", this, function* (input) {
        yield* seq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return lazyFromOperator("reverse", this, async function* (input) {
        yield* await aseq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
