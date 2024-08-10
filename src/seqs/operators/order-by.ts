import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

import { returnKvp } from "../../utils.js"
import { chk } from "../seq/_seq.js"

export function sync<T>(
    this: Iterable<T>,
    projection: Seq.NoIndexIteratee<T, any>,
    reverse = false
): Seq<T> {
    chk(sync).projection(projection)
    chk(sync).reverse(reverse)
    return SeqOperator(this, function* orderBy(input) {
        yield* seq(input)
            .map(e => returnKvp(e, projection(e), e))
            .toArray()
            .map(xs => {
                void xs.sort((a: any, b: any) => {
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
    chk(async).projection(projection)
    chk(async).reverse(reverse)
    return ASeqOperator(this, async function* orderBy(input) {
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
