import { mustBeBoolean, mustBeFunction } from "../../errors/error"
import { asyncOperator, type ASeq } from "../seq/aseq.class"
import { syncOperator, type Seq } from "../seq/seq.class"
import { aseq } from "../seq/aseq.ctor"

import { seq } from "../seq/seq.ctor"
import { returnKvp } from "../../special/utils"

export function sync<T>(
    this: Iterable<T>,
    projection: Seq.NoIndexIteratee<T, any>,
    reverse = false
): Seq<T> {
    mustBeFunction("projection", projection)
    mustBeBoolean("reverse", reverse)
    return new syncOperator("orderBy", this, function* (input) {
        yield* seq(input)
            .map(e => returnKvp(e, projection(e), e))
            .toArray()
            .map(xs => {
                xs.sort((a: any, b: any) => {
                    const result = a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                    return reverse ? -result : result
                })
                return xs.map((x: any) => x.value)
            })
            .pull()
    })
}
export function async<T, S>(
    this: AsyncIterable<T>,
    projection: ASeq.NoIndexIteratee<T, S>,
    reverse = false
): ASeq<T> {
    mustBeFunction("projection", projection)
    mustBeBoolean("reverse", reverse)
    return new asyncOperator("orderBy", this, async function* (input) {
        yield* await aseq(input)
            .map(e => returnKvp(e, projection(e), e))
            .toArray()
            .map(async xs => {
                xs.sort((a, b) => {
                    const comp = a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                    return reverse ? -comp : comp
                })
                return xs.map(x => x.value)
            })
            .pull()
    })
}
