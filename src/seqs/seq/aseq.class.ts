import { async as appendAsync } from "../operators/append.js"
import { async as atAsync } from "../operators/at.js"
import { async as cacheAsync } from "../operators/cache.js"
import { async as concatAsync } from "../operators/concat.js"
import { async as countAsync } from "../operators/count.js"
import { async as eachAsync } from "../operators/each.js"

import { async as catchAsync } from "../operators/catch.js"
import { async as chunkAsync } from "../operators/chunk.js"

import { async as concatMapAsync } from "../operators/concat-map.js"
import { async as everyAsync } from "../operators/every.js"
import { async as filterAsync } from "../operators/filter.js"
import { async as findLastAsync } from "../operators/find-last.js"
import { async as findAsync } from "../operators/find.js"
import { async as firstAsync } from "../operators/first.js"
import { async as groupByAsync } from "../operators/group-by.js"
import { async as includesAsync } from "../operators/includes.js"
import { async as lastAsync } from "../operators/last.js"
import { async as mapAsync } from "../operators/map.js"
import { async as maxByAsync } from "../operators/max-by.js"
import { async as minByAsync } from "../operators/min-by.js"
import { async as orderByAsync } from "../operators/order-by.js"
import { async as reduceAsync } from "../operators/reduce.js"
import { async as reverseAsync } from "../operators/reverse.js"
import { async as scanAsync } from "../operators/scan.js"
import { async as seqEqualsAsync } from "../operators/seq-equals.js"
import { async as setEqualsAsync } from "../operators/set-equals.js"
import { async as shuffleAsync } from "../operators/shuffle.js"
import { async as skipWhileAsync } from "../operators/skip-while.js"
import { async as skipAsync } from "../operators/skip.js"
import { async as someAsync } from "../operators/some.js"
import { async as sumByAsync } from "../operators/sum-by.js"
import { async as takeWhileAsync } from "../operators/take-while.js"
import { async as takeAsync } from "../operators/take.js"
import { async as toArrayAsync } from "../operators/to-array.js"
import { async as toMapAsync } from "../operators/to-map.js"
import { async as toSetAsync } from "../operators/to-set.js"
import { async as uniqByAsync } from "../operators/uniq-by.js"
import { async as uniqAsync } from "../operators/uniq.js"
import { async as windowAsync } from "../operators/window.js"
import { async as zipAsync } from "../operators/zip.js"
import { aseqSymbol } from "./symbol.js"

export abstract class ASeq<T> implements AsyncIterable<T> {
    abstract [Symbol.asyncIterator](): AsyncIterator<T>
    get _qr() {
        return this.toArray().pull()
    }
    readonly [aseqSymbol] = true
    readonly append = appendAsync
    readonly at = atAsync
    readonly catch = catchAsync
    readonly concat = concatAsync
    readonly concatMap = concatMapAsync
    readonly chunk = chunkAsync
    readonly cache = cacheAsync
    readonly count = countAsync
    readonly each = eachAsync
    readonly every = everyAsync
    readonly filter = filterAsync
    readonly findLast = findLastAsync
    readonly find = findAsync
    readonly first = firstAsync
    readonly flatMap = concatMapAsync
    readonly groupBy = groupByAsync
    readonly includes = includesAsync
    readonly last = lastAsync
    readonly map = mapAsync
    readonly maxBy = maxByAsync
    readonly minBy = minByAsync
    readonly orderBy = orderByAsync
    readonly reduce = reduceAsync
    readonly reverse = reverseAsync
    readonly scan = scanAsync
    readonly seqEquals = seqEqualsAsync
    readonly setEquals = setEqualsAsync
    readonly shuffle = shuffleAsync
    readonly skipWhile = skipWhileAsync
    readonly skip = skipAsync
    readonly some = someAsync
    readonly sumBy = sumByAsync
    readonly takeWhile = takeWhileAsync
    readonly take = takeAsync
    readonly toArray = toArrayAsync
    readonly toSet = toSetAsync
    readonly toMap = toMapAsync
    readonly uniqBy = uniqByAsync
    readonly uniq = uniqAsync
    readonly window = windowAsync
    readonly zip = zipAsync
}

type ASyncOperator<In, Out> = AsyncIterable<Out> & {
    _operator: string
    _operand: In
}

export const ASeqOperator = function aseq<In, Out>(
    this: ASyncOperator<In, Out>,
    operand: In,
    impl: (input: In) => AsyncIterable<Out>
) {
    this._operator = impl.name
    this._operand = operand
    this[Symbol.asyncIterator] = function operator() {
        return impl.call(this, this._operand)[Symbol.asyncIterator]()
    }
} as any as {
    new <In, Out>(operand: In, impl: (input: In) => AsyncIterable<Out>): ASeq<Out>
}
ASeqOperator.prototype = new (ASeq as any)()

export namespace ASeq {
    type MaybePromise<T> = T | PromiseLike<T>
    export type IndexIteratee<O> = (index: number) => MaybePromise<O>
    export type Iteratee<E, O> = (element: E, index: number) => MaybePromise<O>
    export type NoIndexIteratee<E, O> = (element: E) => MaybePromise<O>

    export type StageIteratee<E, O> = (
        element: E,
        index: number,
        stage: "before" | "after"
    ) => MaybePromise<O>
    export type Predicate<E> = Iteratee<E, boolean>
    export type Reducer<E, O> = (acc: O, element: E, index: number) => MaybePromise<O>
    export type ElementOfInput<T> = T extends Input<infer E> ? E : never
    export type IterableOrIterator<E> =
        | AsyncIterable<E>
        | AsyncIterator<E>
        | Iterable<E>
        | Iterator<E>
    export type FunctionInput<E> = () => MaybePromise<IterableOrIterator<E>>
    export type DesyncedInput<E> = Iterable<MaybePromise<E>>
    export type IterableInput<E> = DesyncedInput<E> | AsyncIterable<E>
    export type SimpleInput<E> = IterableInput<E> | FunctionInput<E>
    export type Input<E> = SimpleInput<MaybePromise<E>>
}
