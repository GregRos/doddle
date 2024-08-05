import { sync as appendSync } from "../operators/append"
import { sync as aseqSync } from "../operators/aseq"
import { sync as atSync } from "../operators/at"
import { sync as cacheSync } from "../operators/cache"
import { sync as catchSync } from "../operators/catch"
import { sync as chunkSync } from "../operators/chunk"
import { sync as concatSync } from "../operators/concat"
import { sync as concatMapSync } from "../operators/concat-map"
import { sync as countSync } from "../operators/count"
import { sync as eachSync } from "../operators/each"
import { sync as everySync } from "../operators/every"
import { sync as filterSync } from "../operators/filter"
import { sync as findSync } from "../operators/find"
import { sync as findLastSync } from "../operators/find-last"
import { sync as firstSync } from "../operators/first"
import { sync as groupBySync } from "../operators/group-by"
import { sync as includesSync } from "../operators/includes"
import { sync as lastSync } from "../operators/last"
import { sync as mapSync } from "../operators/map"
import { sync as maxBySync } from "../operators/max-by"
import { sync as minBySync } from "../operators/min-by"
import { sync as orderBySync } from "../operators/order-by"
import { sync as reduceSync } from "../operators/reduce"
import { sync as reverseSync } from "../operators/reverse"
import { sync as scanSync } from "../operators/scan"
import { sync as seqEqualsSync } from "../operators/seq-equals"
import { sync as setEqualsSync } from "../operators/set-equals"
import { sync as shuffleSync } from "../operators/shuffle"
import { sync as skipSync } from "../operators/skip"
import { sync as skipWhileSync } from "../operators/skip-while"
import { sync as someSync } from "../operators/some"
import { sync as sumBySync } from "../operators/sum-by"
import { sync as takeSync } from "../operators/take"
import { sync as takeWhileSync } from "../operators/take-while"
import { sync as toArraySync } from "../operators/to-array"
import { sync as toMapSync } from "../operators/to-map"
import { sync as toSetSync } from "../operators/to-set"
import { sync as uniqSync } from "../operators/uniq"
import { sync as uniqBySync } from "../operators/uniq-by"
import { sync as windowSync } from "../operators/window"
import { sync as zipSync } from "../operators/zip"
import { seq } from "./seq.ctor"
import { seqSymbol } from "./symbol"

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

interface SyncOperator<In, Out> extends Iterable<Out> {
    _operator: string
    _operand: In
}

export const SeqOperator = function seq<In, Out>(
    this: SyncOperator<In, Out>,
    operand: In,
    impl: (input: In) => Iterable<Out>
) {
    this._operator = impl.name
    this._operand = operand
    this[Symbol.iterator] = function operator() {
        return impl.call(this, this._operand)[Symbol.iterator]()
    }
} as any as {
    new <In, Out>(operand: In, impl: (input: In) => Iterable<Out>): Seq<Out>
}
SeqOperator.prototype = new (Seq as any)()
export namespace Seq {
    export type IndexIteratee<O> = (index: number) => O

    export type Iteratee<E, O> = (element: E, index: number) => O
    export type NoIndexIteratee<E, O> = (element: E) => O

    export type StageIteratee<E, O> = (element: E, index: number, stage: "before" | "after") => O
    export type Predicate<E> = Seq.Iteratee<E, boolean>
    export type TypePredicate<E, T extends E> = (element: E, index: number) => element is T

    export type Reducer<E, O> = (acc: O, element: E, index: number) => O
    export type IterableOrIterator<E> = Iterable<E> | Iterator<E>
    export type FunctionInput<E> = () => IterableOrIterator<E>

    export type IterableInput<E> = Iterable<E>
    export type Input<E> = IterableInput<E> | FunctionInput<E>
    export type ElementOfInput<T> = T extends Input<infer E> ? E : never
}
