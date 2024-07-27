import { mustBeFunction } from "../errors/error"
import { type AsyncPredicate, type Predicate } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"
import type { maybeDisjunction } from "../type-functions/maybe-disjunction"

export function sync<T, const Ellipsis = undefined>(
    this: Iterable<T>,
    predicate: Predicate<T>,
    ellipsisItem?: Ellipsis
): Seq<maybeDisjunction<T, Ellipsis>> {
    const hasEllipsis = ellipsisItem !== undefined
    mustBeFunction("predicate", predicate)
    return syncFromOperator("skipWhile", this, function* (input) {
        let skipping = true
        let index = 0
        for (const element of input) {
            if (skipping && predicate(element, index++)) {
                if (!predicate(element, index++)) {
                    if (index > 1 && hasEllipsis) {
                        yield ellipsisItem as Ellipsis
                    }
                    skipping = false
                    yield element
                }
            } else {
                yield element
            }
        }
    }) as any
}
export function async<T, const Ellipsis = undefined>(
    this: AsyncIterable<T>,
    predicate: AsyncPredicate<T>,
    ellipsisItem?: Ellipsis
): ASeq<maybeDisjunction<T, Ellipsis>> {
    const hasEllipsis = ellipsisItem !== undefined
    mustBeFunction("predicate", predicate)
    return asyncFromOperator("skipWhile", this, async function* (input) {
        let skipping = true
        let index = 0
        for await (const element of input) {
            if (skipping) {
                if (!(await predicate(element, index++))) {
                    if (index > 1 && hasEllipsis) {
                        yield ellipsisItem as Ellipsis
                    }
                    skipping = false
                    yield element
                }
            } else {
                yield element
            }
        }
    }) as any
}
