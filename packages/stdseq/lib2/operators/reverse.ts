import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { seq } from "../wrappers/seq.ctor"
import { aseq } from "../wrappers/aseq.ctor"

export function sync<T>(this: Iterable<T>) {
    return lazyFromOperator("reverse", this, input => {
        return seq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return lazyFromOperator("reverse", this, async input => {
        return aseq(input)
            .toArray()
            .map(x => x.reverse())
            .pull()
    })
}
