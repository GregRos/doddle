import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"
import type { getWindowArgsType, getWindowOutputType } from "./window.types.js"
function window<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection: (...window: getWindowArgsType<T, L>) => S
): Seq<S>
function window<T, L extends number>(this: Iterable<T>, size: L): Seq<getWindowOutputType<T, L>>
function window<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection?: (...window: getWindowArgsType<T, L>) => S
): Seq<any> {
    chk(window).size(size)
    projection ??= (...window: any) => window as any
    chk(window).projection(projection)
    return SeqOperator(this, function* window(input) {
        const buffer = Array<T>(size)
        let i = 0
        for (const item of input) {
            buffer[i++ % size] = item
            if (i >= size) {
                yield (projection as any).call(
                    null,
                    ...buffer.slice(i % size),
                    ...buffer.slice(0, i % size)
                )
            }
        }
        if (i > 0 && i < size) {
            yield (projection as any).call(null, ...buffer.slice(0, i))
        }
    })
}
export default window
