import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import { aseq } from "../seq/aseq.ctor"

import { seq } from "../seq/seq.ctor"

export function sync<T>(this: Iterable<T>) {
    return new syncOperator("reverse", this, function* (input) {
        yield* seq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return new asyncOperator("reverse", this, async function* (input) {
        yield* await aseq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
