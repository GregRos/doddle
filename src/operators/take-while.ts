import { mustBeFunction } from "../errors/error"
import { type AsyncPredicate, type Predicate } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

export interface TakeWhileSpecifier {
    takeFinal?: boolean
}
export function sync<T>(
    this: Iterable<T>,
    predicate: Predicate<T>,
    specifier?: TakeWhileSpecifier
): Seq<T> {
    mustBeFunction("predicate", predicate)
    return syncFromOperator("takeWhile", this, function* (input) {
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
    predicate: AsyncPredicate<T>,
    specifier?: TakeWhileSpecifier
): ASeq<T> {
    mustBeFunction("predicate", predicate)
    return asyncFromOperator("takeWhile", this, async function* (input) {
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
