import { _iter } from "../../utils.js"
import { sync as appendSync } from "../operators/append.js"
import { sync as aseqSync } from "../operators/aseq.js"
import { sync as atSync } from "../operators/at.js"
import { sync as cacheSync } from "../operators/cache.js"
import { sync as catchSync } from "../operators/catch.js"
import { sync as chunkSync } from "../operators/chunk.js"
import { sync as concatMapSync } from "../operators/concat-map.js"
import { sync as concatSync } from "../operators/concat.js"
import { sync as countSync } from "../operators/count.js"
import { sync as eachSync } from "../operators/each.js"
import { sync as everySync } from "../operators/every.js"
import { sync as filterSync } from "../operators/filter.js"
import { sync as findLastSync } from "../operators/find-last.js"
import { sync as findSync } from "../operators/find.js"
import { sync as firstSync } from "../operators/first.js"
import { sync as groupBySync } from "../operators/group-by.js"
import { sync as includesSync } from "../operators/includes.js"
import { sync as lastSync } from "../operators/last.js"
import { sync as mapSync } from "../operators/map.js"
import { sync as maxBySync } from "../operators/max-by.js"
import { sync as minBySync } from "../operators/min-by.js"
import { sync as orderBySync } from "../operators/order-by.js"
import { sync as reduceSync } from "../operators/reduce.js"
import { sync as reverseSync } from "../operators/reverse.js"
import { sync as scanSync } from "../operators/scan.js"
import { sync as seqEqualsSync } from "../operators/seq-equals.js"
import { sync as setEqualsSync } from "../operators/set-equals.js"
import { sync as shuffleSync } from "../operators/shuffle.js"
import { sync as skipWhileSync } from "../operators/skip-while.js"
import { sync as skipSync } from "../operators/skip.js"
import { sync as someSync } from "../operators/some.js"
import { sync as sumBySync } from "../operators/sum-by.js"
import { sync as takeWhileSync } from "../operators/take-while.js"
import { sync as takeSync } from "../operators/take.js"
import { sync as toArraySync } from "../operators/to-array.js"
import { sync as toMapSync } from "../operators/to-map.js"
import { sync as toSetSync } from "../operators/to-set.js"
import { sync as uniqBySync } from "../operators/uniq-by.js"
import { sync as uniqSync } from "../operators/uniq.js"
import { sync as windowSync } from "../operators/window.js"
import { sync as zipSync } from "../operators/zip.js"
import { seqSymbol } from "./symbol.js"

export abstract class Seq<T> implements Iterable<T> {
    abstract [Symbol.iterator](): Iterator<T>
    get _qr() {
        return this.toArray().pull()
    }
    readonly [seqSymbol] = true
    readonly append = appendSync
    readonly aseq = aseqSync
    readonly at = atSync
    readonly cache = cacheSync
    readonly catch = catchSync
    readonly concat = concatSync
    readonly chunk = chunkSync
    readonly concatMap = concatMapSync
    readonly count = countSync
    readonly each = eachSync
    readonly every = everySync
    readonly filter = filterSync
    readonly findLast = findLastSync
    readonly find = findSync
    readonly first = firstSync
    readonly flatMap = concatMapSync
    readonly groupBy = groupBySync
    readonly includes = includesSync
    readonly last = lastSync
    readonly map = mapSync
    readonly maxBy = maxBySync
    readonly minBy = minBySync
    readonly orderBy = orderBySync
    readonly reduce = reduceSync
    readonly reverse = reverseSync
    readonly scan = scanSync
    readonly seqEquals = seqEqualsSync
    readonly setEquals = setEqualsSync
    readonly shuffle = shuffleSync
    readonly skipWhile = skipWhileSync
    readonly skip = skipSync
    readonly some = someSync
    readonly sumBy = sumBySync
    readonly takeWhile = takeWhileSync
    readonly take = takeSync
    readonly toArray = toArraySync
    readonly toSet = toSetSync
    readonly toMap = toMapSync
    readonly uniqBy = uniqBySync
    readonly uniq = uniqSync
    readonly window = windowSync
    readonly zip = zipSync
}

let baseSeq!: Seq<any>
export const SeqOperator = function seq<In, Out>(
    operand: In,
    impl: (input: In) => Iterable<Out>
): Seq<Out> {
    if (!baseSeq) {
        baseSeq = new (Seq as any)()
    }
    const obj = Object.create(baseSeq)
    return Object.assign(obj, {
        _operator: impl.name,
        _operand: operand,
        [Symbol.iterator]: function operator() {
            return _iter(impl.call(this, this._operand))
        }
    })
}

export namespace Seq {
    export type IndexIteratee<O> = (index: number) => O

    export type Iteratee<E, O> = (element: E, index: number) => O
    export type NoIndexIteratee<E, O> = (element: E) => O

    export type StageIteratee<E, O> = (element: E, index: number, stage: "before" | "after") => O
    export type Predicate<E> = Iteratee<E, boolean>
    export type TypePredicate<E, T extends E> = (element: E, index: number) => element is T

    export type Reducer<E, O> = (acc: O, element: E, index: number) => O
    export type IterableOrIterator<E> = Iterable<E> | Iterator<E>
    export type FunctionInput<E> = () => IterableOrIterator<E>

    export type IterableInput<E> = Iterable<E>
    export type Input<E> = IterableInput<E> | FunctionInput<E>
    export type ElementOfInput<T> = T extends Input<infer E> ? E : never
}
