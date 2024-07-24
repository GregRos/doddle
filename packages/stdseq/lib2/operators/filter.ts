import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import {
    Iteratee,
    AsyncIteratee,
    type Predicate,
    type AsyncPredicate,
    type TypePredicate
} from "../f-types/index"
import { mustBeFunction } from "../errors/error"
import type { Seq } from "../seq"
import type { ASeq } from "../aseq"

export function sync<T, S extends T>(this: Iterable<T>, predicate: TypePredicate<T, S>): Seq<S>
export function sync<T>(this: Iterable<T>, predicate: Predicate<T>): Seq<T>
export function sync<T>(this: Iterable<T>, predicate: Predicate<T>) {
    mustBeFunction("predicate", predicate)
    return syncFromOperator("filter", this, function* (input) {
        let index = 0
        for (const element of input) {
            if (predicate(element, index++)) {
                yield element
            }
        }
    })
}

export function async<T, S extends T>(
    this: AsyncIterable<T>,
    predicate: TypePredicate<T, S>
): ASeq<S>
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>): ASeq<T>
export function async<T>(this: AsyncIterable<T>, predicate: AsyncPredicate<T>) {
    mustBeFunction("predicate", predicate)
    return asyncFromOperator("filter", this, async function* (input) {
        let index = 0
        for await (const element of input) {
            if (await predicate(element, index++)) {
                yield element
            }
        }
    })
}
