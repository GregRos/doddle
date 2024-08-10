import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

type getConcatElementType<T, S> = T extends never ? never : S
function concatMap<T, S>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, ASeq.SimpleInput<S>>
): ASeq<getConcatElementType<T, S>> {
    chk(concatMap).projection(projection)
    return ASeqOperator(this, async function* concatMap(input) {
        let index = 0
        for await (const element of input) {
            for await (const projected of aseq(await projection(element, index++))) {
                yield projected
            }
        }
    }) as any
}
export default concatMap
