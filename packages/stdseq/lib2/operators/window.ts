import { mustBePositiveInt } from "../errors/error"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"
import type { getTupleUpTo } from "../type-functions/get-tuple-min-max"

export function sync<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection: (...window: getTupleUpTo<T, L>) => S
): Seq<S>
export function sync<T, L extends number>(this: Iterable<T>, size: L): Seq<getTupleUpTo<T, L>>
export function sync<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection?: (...window: getTupleUpTo<T, L>) => S
): Seq<any> {
    mustBePositiveInt("windowSize", size)
    projection ??= (...window: any) => window as any
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
        if (i > 0 && i < size) {
            yield (projection as any).call(null, ...buffer.slice(0, i))
        }
    })
}
export function async<T, S, L extends number>(
    this: AsyncIterable<T>,
    size: L,
    projection: (...window: getTupleUpTo<T, L>) => S
): ASeq<S>
export function async<T, L extends number>(
    this: AsyncIterable<T>,
    size: L
): ASeq<getTupleUpTo<T, L>>
export function async<T, L extends number, S>(
    this: AsyncIterable<T>,
    size: L,
    projection?: (...window: getTupleUpTo<T, L>) => S
): ASeq<any> {
    mustBePositiveInt("windowSize", size)
    projection ??= (...window: any) => window as any
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

        if (i > 0 && i < size) {
            yield (projection as any).call(null, ...buffer.slice(0, i))
        }
    })
}
