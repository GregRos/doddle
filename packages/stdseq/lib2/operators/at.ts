import { seq } from "../wrappers/seq.ctor"
import { lazyFromOperator } from "../from/operator"
import { mustBeInteger, mustBeNatural } from "../errors/error"
import { aseq } from "../wrappers/aseq.ctor"

export function sync<T>(this: Iterable<T>, index: number) {
    mustBeInteger("index", index)

    return lazyFromOperator("at", this, input => {
        if (index < 0) {
            return seq(input).take(index).first().pull()
        }
        return seq(input).skip(index).first().pull()
    })
}
export function async<T>(this: AsyncIterable<T>, index: number) {
    mustBeInteger("index", index)
    return lazyFromOperator("at", this, async input => {
        if (index < 0) {
            return await aseq(input).take(index).first().pull()
        }
        return await aseq(input).skip(index).first().pull()
    })
}
