import { mustBeNatural } from "../errors/error"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { getMostlyOptionalTuple } from "../type-functions/get-optional-tuple"
import type { getTuple } from "../type-functions/get-tuple"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

export function sync<T, S, L extends number>(
    this: Iterable<T>,
    size: L,
    projection: (...window: getMostlyOptionalTuple<T, L>) => S
): Seq<S> {
    mustBeNatural("windowSize", size)
    return syncFromOperator("window", this, function* (input) {
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
        if (i < size) {
            yield (projection as any).call(null, ...buffer.slice(0, i))
        }
    })
}
export function async<T, S, L extends number, AllowSmaller extends boolean = false>(
    this: AsyncIterable<T>,
    size: L,
    projection: (...window: getMostlyOptionalTuple<T, L>) => S
): ASeq<S> {
    mustBeNatural("windowSize", size)
    return asyncFromOperator("window", this, async function* (input) {
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

        if (i < size) {
            yield (projection as any).call(null, ...buffer.slice(0, i))
        }
    })
}
