import type { ASeq } from "../wrappers/aseq.class"
import { mustBeNatural, mustBePositiveInt, notEnoughElements } from "../errors/error"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { Seq } from "../wrappers/seq.class"
import type { getMostlyOptionalTuple } from "../type-functions/get-optional-tuple"
import type { getTuple } from "../type-functions/get-tuple"

type getChunkType<T, L extends number, AllowSmaller extends boolean> = boolean extends AllowSmaller
    ? getMostlyOptionalTuple<T, L>
    : AllowSmaller extends false
      ? getTuple<T, L>
      : getMostlyOptionalTuple<T, L>

export function sync<T, L extends number, AllowSmaller extends boolean = false>(
    this: Iterable<T>,
    size: L,
    allowSmaller?: AllowSmaller
): Seq<getChunkType<T, L, AllowSmaller>> {
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
            if (allowSmaller) {
                yield group as getMostlyOptionalTuple<T, L>
            } else {
                notEnoughElements("target", group.length, size)
            }
        }
    }) as any
}

export function async<T, L extends number, AllowSmaller extends boolean = false>(
    this: AsyncIterable<T>,
    size: L,
    allowSmaller?: AllowSmaller
): ASeq<getChunkType<T, L, AllowSmaller>> {
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
            if (allowSmaller) {
                yield group as getMostlyOptionalTuple<T, L>
            } else {
                notEnoughElements("target", group.length, size)
            }
        }
    }) as any
}
