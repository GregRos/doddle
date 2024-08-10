import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import type { getWindowArgsType, getWindowOutputType } from "./window.types.js"
function chunk<T, L extends number, S>(
    this: AsyncIterable<T>,
    size: L,
    projection: (...window: getWindowArgsType<T, L>) => S
): ASeq<S>
function chunk<T, L extends number>(
    this: AsyncIterable<T>,
    size: L
): ASeq<getWindowOutputType<T, L>>
function chunk<T, L extends number, S>(
    this: AsyncIterable<T>,
    size: L,
    projection?: (...window: getWindowArgsType<T, L>) => S
): ASeq<getWindowOutputType<T, L>> {
    chk(chunk).size(size)
    projection ??= (...chunk: any) => chunk as any
    chk(chunk).projection(projection)
    return ASeqOperator(this, async function* chunk(input) {
        let chunk: T[] = []
        for await (const item of input) {
            chunk.push(item)
            if (chunk.length === size) {
                yield projection(...(chunk as any))
                chunk = []
            }
        }
        if (chunk.length) {
            yield projection(...(chunk as any))
        }
    }) as any
}
export default chunk
