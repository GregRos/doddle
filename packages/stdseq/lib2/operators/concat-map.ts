import { mustBeFunction } from "../errors/error"
import { AsyncIteratee, Iteratee, type ASeqLikeInput, type SeqLikeInput } from "../f-types/index"
import { fromAsyncInput, fromSyncInput } from "../from/input"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"
type getConcatElementType<T, S> = T extends never ? never : S
export function sync<T, S>(
    this: Iterable<T>,
    projection: Iteratee<T, SeqLikeInput<S>>
): Seq<getConcatElementType<T, S>> {
    mustBeFunction("projection", projection)
    return syncFromOperator("concatMap", this, function* (input) {
        let index = 0
        for (const element of input) {
            for (const projected of fromSyncInput(projection(element, index++))) {
                yield projected
            }
        }
    }) as any
}
export function async<T, S>(
    this: AsyncIterable<T>,
    projection: AsyncIteratee<T, ASeqLikeInput<S>>
): ASeq<getConcatElementType<T, S>> {
    mustBeFunction("projection", projection)
    return asyncFromOperator("concatMap", this, async function* (input) {
        let index = 0
        for await (const element of input) {
            for await (const projected of fromAsyncInput(await projection(element, index++))) {
                yield projected
            }
        }
    }) as any
}
