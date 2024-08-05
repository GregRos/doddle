import { mustBeFunction } from "../../errors/error"
import { ASeqOperator, type ASeq } from "../seq/aseq.class"
import { SeqOperator, type Seq } from "../seq/seq.class"

export function sync<T>(this: Iterable<T>, projection: Seq.NoIndexIteratee<T, any>): Seq<T> {
    mustBeFunction("projection", projection)
    return new SeqOperator(this, function* uniqBy(input) {
        const seen = new Set()
        for (const element of input) {
            const key = projection(element)
            if (!seen.has(key)) {
                seen.add(key)
                yield element
            }
        }
    })
}
export function async<T>(
    this: AsyncIterable<T>,
    projection: ASeq.NoIndexIteratee<T, any>
): ASeq<T> {
    mustBeFunction("projection", projection)
    return new ASeqOperator(this, async function* uniqBy(input) {
        const seen = new Set()
        for await (const element of input) {
            const key = await projection(element)
            if (!seen.has(key)) {
                seen.add(key)
                yield element
            }
        }
    })
}
