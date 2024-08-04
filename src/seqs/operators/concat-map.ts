import { mustBeFunction } from "../../errors/error"
import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
type getConcatElementType<T, S> = T extends never ? never : S
export function sync<T, S>(
    this: Iterable<T>,
    projection: Seq.Iteratee<T, Seq.Input<S>>
): Seq<getConcatElementType<T, S>> {
    mustBeFunction("projection", projection)
    return new syncOperator("concatMap", this, function* (input) {
        let index = 0
        for (const element of input) {
            for (const projected of seq(projection(element, index++))) {
                yield projected
            }
        }
    }) as any
}
export function async<T, S>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, ASeq.SimpleInput<S>>
): ASeq<getConcatElementType<T, S>> {
    mustBeFunction("projection", projection)
    return new asyncOperator("concatMap", this, async function* (input) {
        let index = 0
        for await (const element of input) {
            for await (const projected of aseq(await projection(element, index++))) {
                yield projected
            }
        }
    }) as any
}
