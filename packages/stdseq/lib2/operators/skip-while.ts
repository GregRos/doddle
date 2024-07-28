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
        let needEllipsis = false
        for (const element of input) {
            skipping = skipping && predicate(element, index++)
            if (skipping && hasEllipsis) {
                needEllipsis = true
            }
            if (!skipping) {
                if (needEllipsis) {
                    needEllipsis = false
                    yield ellipsisItem as Ellipsis
                }
                yield element
            }
        }
        if (needEllipsis) {
            yield ellipsisItem as Ellipsis
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
        let needEllipsis = false
        for await (const element of input) {
            skipping = skipping && (await predicate(element, index++))
            if (skipping && hasEllipsis) {
                needEllipsis = true
            }
            if (!skipping) {
                if (needEllipsis) {
                    needEllipsis = false
                    yield ellipsisItem as Ellipsis
                }
                yield element
            }
        }
        if (needEllipsis) {
            yield ellipsisItem as Ellipsis
        }
    }) as any
}
