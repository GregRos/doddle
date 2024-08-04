import { mustBeFunction } from "../../errors/error"
import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import type { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

export interface TakeWhileSpecifier {
    takeFinal?: boolean
}
export function sync<T>(
    this: Iterable<T>,
    predicate: Seq.Predicate<T>,
    specifier?: TakeWhileSpecifier
): Seq<T> {
    mustBeFunction("predicate", predicate)
    return new syncOperator("takeWhile", this, function* (input) {
        let index = 0
        for (const element of input) {
            if (predicate(element, index++)) {
                yield element
            } else {
                if (specifier?.takeFinal) {
                    yield element
                }
                return
            }
        }
    }) as any
}
export function async<T>(
    this: AsyncIterable<T>,
    predicate: ASeq.Predicate<T>,
    specifier?: TakeWhileSpecifier
): ASeq<T> {
    mustBeFunction("predicate", predicate)
    return new asyncOperator("takeWhile", this, async function* (input) {
        let index = 0

        for await (const element of input) {
            if (await predicate(element, index++)) {
                yield element
            } else {
                if (specifier?.takeFinal) {
                    yield element
                }
                return
            }
        }
    }) as any
}
