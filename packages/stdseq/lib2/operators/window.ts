import { seq } from "../seq"
import { aseq } from "../aseq"
import { asyncFromOperator, lazyFromOperator, syncFromOperator } from "../from/operator"
import type { getOptionalTuple } from "../type-functions/get-optional-tuple"
import type { Seq } from "../seq"
import type { ASeq } from "../aseq"
import type { getTuple } from "../type-functions/get-tuple"
import { mustBeNatural, notEnoughElements } from "../errors/error"

export function sync<T, S, L extends number, AllowSmaller extends boolean = false>(
    this: Iterable<T>,
    size: L,
    projection: (
        ...window: AllowSmaller extends false ? getTuple<T, L> : getOptionalTuple<T, L>
    ) => S,
    allowSmaller?: AllowSmaller
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

        if (i < size && allowSmaller) {
            yield (projection as any).call(null, ...buffer.slice(0, i))
            return
        }
    })
}
export function async<T, S, L extends number, AllowSmaller extends boolean = false>(
    this: AsyncIterable<T>,
    size: L,
    projection: (
        ...window: AllowSmaller extends false ? getTuple<T, L> : getOptionalTuple<T, L>
    ) => S,
    allowSmaller?: AllowSmaller
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

        if (i < size && allowSmaller) {
            yield (projection as any).call(null, ...buffer.slice(0, i))
            return
        }
    })
}
