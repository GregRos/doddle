import { mustBePositiveInt } from "../../errors/error"
import type { ASeq } from "../seq/aseq.class"
import { ASeqOperator } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"
import { SeqOperator } from "../seq/seq.class"
import type { getWindowArgsType, getWindowOutputType } from "./window.types"

export function sync<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection: (...window: getWindowArgsType<T, L>) => S
): Seq<S>
export function sync<T, L extends number>(
    this: Iterable<T>,
    size: L
): Seq<getWindowOutputType<T, L>>
export function sync<T, L extends number>(
    this: Iterable<T>,
    size: L,
    projection?: (...window: getWindowArgsType<T, L>) => any
): Seq<getWindowOutputType<T, L>> {
    mustBePositiveInt("size", size)
    projection ??= (...chunk: any) => chunk as any
    return new SeqOperator(this, function* chunk(input) {
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
): ASeq<getWindowOutputType<T, L>> {
    mustBePositiveInt("size", size)
    projection ??= (...chunk: any) => chunk as any
    return new ASeqOperator(this, async function* chunk(input) {
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
