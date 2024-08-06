import { mustBePositiveInt } from "../../errors/error.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"
import type { getWindowArgsType, getWindowOutputType } from "./window.types.js"

export function sync<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection: (...window: getWindowArgsType<T, L>) => S
): Seq<S>
export function sync<T, L extends number>(
    this: Iterable<T>,
    size: L
): Seq<getWindowOutputType<T, L>>
export function sync<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection?: (...window: getWindowArgsType<T, L>) => S
): Seq<any> {
    mustBePositiveInt("windowSize", size)
    projection ??= (...window: any) => window as any
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
export function async<T, L extends number, S>(
    this: AsyncIterable<T>,
    size: L,
    projection: (...window: getWindowArgsType<T, L>) => S
): ASeq<S>
export function async<T, L extends number>(
    this: AsyncIterable<T>,
    size: L
): ASeq<getWindowOutputType<T, L>>
export function async<T, L extends number, S>(
    this: AsyncIterable<T>,
    size: L,
    projection?: (...window: getWindowArgsType<T, L>) => S
): ASeq<any> {
    mustBePositiveInt("windowSize", size)
    projection ??= (...window: any) => window as any
    return ASeqOperator(this, async function* window(input) {
        const buffer = Array<T>(size)
        let i = 0
        for await (const item of input) {
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
