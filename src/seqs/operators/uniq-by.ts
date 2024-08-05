import { mustBeFunction } from "../../errors/error"
import { ASeqOperator, type ASeq } from "../seq/aseq.class"
import { SeqOperator, type Seq } from "../seq/seq.class"
import type { aseq } from "../seq/aseq.ctor"

export function sync<T>(this: Iterable<T>, projection: Seq.NoIndexIteratee<T, any>): Seq<T> {
    mustBeFunction("projection", projection)
    return new SeqOperator("uniqBy", this, function* (input) {
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
    return new ASeqOperator("uniqBy", this, async function* (input) {
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
