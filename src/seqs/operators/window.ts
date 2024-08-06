import { checkSize } from "../../errors/error.js"
import { aseq } from "../../index.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"
import { seq } from "../seq/seq.ctor.js"
import type { getWindowArgsType, getWindowOutputType } from "./window.types.js"

export function compute<T, S>(
    input: Seq<T>,
    size: number,
    projection: (...window: any[]) => S
): any {
    const buffer = Array<T>(size)
    let i = 0
    return input
        .concatMap(element => {
            buffer[i++ % size] = element
            if (i >= size) {
                return [projection(...buffer.slice(i % size), ...buffer.slice(0, i % size))]
            }
            return []
        })
        .concat(
            seq(() => {
                if (i > 0 && i < size) {
                    return [projection(...buffer.slice(0, i))]
                }
                return []
            })
        )
}

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
    checkSize(size)
    projection ??= (...window: any) => window as any
    return SeqOperator(this, function* window(input) {
        yield* compute(seq(input), size, projection)
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
    checkSize(size)
    projection ??= (...window: any) => window as any
    return ASeqOperator(this, async function* window(input) {
        yield* await compute(aseq(input) as any, size, projection)
    })
}
