import { mustBePositiveInt } from "../../errors/error"
import { ASeqOperator } from "../seq/aseq.class"
import { SeqOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"
import type {
    getReturnedWindowType,
    getWindowProjectionArgsType
} from "../type-functions/get-window-type"

export function sync<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection: (...window: getWindowProjectionArgsType<T, L>) => S
): Seq<S>
export function sync<T, L extends number>(
    this: Iterable<T>,
    size: L
): Seq<getReturnedWindowType<T, L>>
export function sync<T, L extends number>(
    this: Iterable<T>,
    size: L,
    projection?: (...window: getWindowProjectionArgsType<T, L>) => any
): Seq<getReturnedWindowType<T, L>> {
    mustBePositiveInt("size", size)
    projection ??= (...chunk: any) => chunk as any
    return new SeqOperator("chunk", this, function* (input) {
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
    projection: (...window: getWindowProjectionArgsType<T, L>) => S
): ASeq<S>
export function async<T, L extends number>(
    this: AsyncIterable<T>,
    size: L
): ASeq<getReturnedWindowType<T, L>>
export function async<T, L extends number, S>(
    this: AsyncIterable<T>,
    size: L,
    projection?: (...window: getWindowProjectionArgsType<T, L>) => S
): ASeq<getReturnedWindowType<T, L>> {
    mustBePositiveInt("size", size)
    projection ??= (...chunk: any) => chunk as any
    return new ASeqOperator("chunk", this, async function* (input) {
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
