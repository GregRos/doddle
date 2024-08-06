import { checkProjection } from "../../errors/error.js"
import { aseq, seq } from "../../index.js"
import { returnKvp } from "../../utils.js"
import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"

// implement using concatMap
export function generic<T, K>(input: Seq<T>, projection: Seq.NoIndexIteratee<T, K>) {
    const set = new Set<K>()
    return input
        .map(function (element) {
            return returnKvp(input, projection(element), element) as any
        })
        .concatMap(({ key, value }) => {
            if (set.has(key)) {
                return []
            }
            set.add(key)
            return [value]
        })
}

export function sync<T>(this: Iterable<T>, projection: Seq.NoIndexIteratee<T, any>): Seq<T> {
    checkProjection(projection)
    return SeqOperator(this, function* uniqBy(input) {
        yield* generic(seq(input), projection)
    })
}
export function async<T>(
    this: AsyncIterable<T>,
    projection: ASeq.NoIndexIteratee<T, any>
): ASeq<T> {
    checkProjection(projection)
    return ASeqOperator(this, async function* uniqBy(input) {
        yield* generic(aseq(input) as any, projection) as any
    })
}
