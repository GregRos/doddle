import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"
import type { getWindowArgsType, getWindowOutputType } from "./window.types.js"
function chunk<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection: (...window: getWindowArgsType<T, L>) => S
): Seq<S>
function chunk<T, L extends number>(this: Iterable<T>, size: L): Seq<getWindowOutputType<T, L>>
function chunk<T, L extends number>(
    this: Iterable<T>,
    size: L,
    projection?: (...window: getWindowArgsType<T, L>) => any
): Seq<getWindowOutputType<T, L>> {
    chk(chunk).size(size)
    projection ??= (...chunk: any) => chunk as any
    chk(chunk).projection(projection)

    return SeqOperator(this, function* chunk(input) {
        let chunk: T[] = []
        for (const item of input) {
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
