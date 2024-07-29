import { mustBePositiveInt } from "../errors/error"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"
import type { getTuple } from "../type-functions/get-tuple"
import type { getTupleUpTo } from "../type-functions/get-tuple-min-max"

type getChunkType<T, L extends number> = getTupleUpTo<T, L>

export function sync<T, L extends number>(this: Iterable<T>, size: L): Seq<getChunkType<T, L>> {
    mustBePositiveInt("size", size)
    return syncFromOperator("chunk", this, function* (input) {
        let group: T[] = []
        for (const item of input) {
            group.push(item)
            if (group.length === size) {
                yield group as getTuple<T, L>
                group = []
            }
        }
        if (group.length) {
            yield group as getChunkType<T, L>
        }
    }) as any
}

export function async<T, L extends number>(
    this: AsyncIterable<T>,
    size: L
): ASeq<getChunkType<T, L>> {
    mustBePositiveInt("size", size)

    return asyncFromOperator("chunk", this, async function* (input) {
        let group: T[] = []
        for await (const item of input) {
            group.push(item)
            if (group.length === size) {
                yield group as getTuple<T, L>
                group = []
            }
        }
        if (group.length) {
            yield group as getChunkType<T, L>
        }
    }) as any
}
