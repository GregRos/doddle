import { mustBeFunction } from "../errors/error"
import { type AsyncPredicate, type Predicate } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"
import type { maybeDisjunction } from "../type-functions/maybe-disjunction"

export function sync<T, const Ellipsis = undefined>(
    this: Iterable<T>,
    predicate: Predicate<T>,
    ellipsis?: Ellipsis
): Seq<maybeDisjunction<T, Ellipsis>> {
    const hasEllipsis = arguments.length === 2
    mustBeFunction("predicate", predicate)
    return syncFromOperator("takeWhile", this, function* (input) {
        let index = 0
        for (const element of input) {
            if (predicate(element, index++)) {
                yield element
            } else {
                if (hasEllipsis) {
                    yield ellipsis as Ellipsis
                }
                return
            }
        }
    }) as any
}
export function async<T, const Ellipsis = undefined>(
    this: AsyncIterable<T>,
    predicate: AsyncPredicate<T>,
    ellipsis?: Ellipsis
): ASeq<maybeDisjunction<T, Ellipsis>> {
    const hasEllipsis = arguments.length === 2
    mustBeFunction("predicate", predicate)
    return asyncFromOperator("takeWhile", this, async function* (input) {
        let index = 0

        for await (const element of input) {
            if (await predicate(element, index++)) {
                yield element
            } else {
                if (hasEllipsis) {
                    yield ellipsis as Ellipsis
                }
                return
            }
        }
    }) as any
}
