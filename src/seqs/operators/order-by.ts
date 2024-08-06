import { checkProjection, checkReverse } from "../../errors/error.js"
import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

import { returnKvp } from "../../utils.js"

export function computeIt<T>(
    input: Seq<T>,
    projection: Seq.NoIndexIteratee<T, any>,
    reverse = false
): any {
    return input
        .map(e => returnKvp(e, projection(e), e))
        .toArray()
        .map(xs => {
            void xs.sort((a: any, b: any) => {
                const result = a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                return reverse ? -result : result
            })
            return xs.map((x: any) => x.value) as T[]
        })
        .pull()
}
export function sync<T>(
    this: Iterable<T>,
    projection: Seq.NoIndexIteratee<T, any>,
    reverse = false
): Seq<T> {
    checkProjection(projection)
    checkReverse(reverse)
    return SeqOperator(this, function* orderBy(input) {
        yield* computeIt(seq(input), projection, reverse)
    })
}
export function async<T, S>(
    this: AsyncIterable<T>,
    projection: ASeq.NoIndexIteratee<T, S>,
    reverse = false
): ASeq<T> {
    checkProjection(projection)
    checkReverse(reverse)
    return ASeqOperator(this, async function* orderBy(input) {
        yield* await computeIt(aseq(input) as any, projection, reverse)
    })
}
