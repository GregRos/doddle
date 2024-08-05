import { async as appendAsync } from "../operators/append"
import { async as atAsync } from "../operators/at"
import { async as cacheAsync } from "../operators/cache"
import { async as concatAsync } from "../operators/concat"
import { async as countAsync } from "../operators/count"
import { async as eachAsync } from "../operators/each"

import { async as catchAsync } from "../operators/catch"
import { async as chunkAsync } from "../operators/chunk"

import { async as concatMapAsync } from "../operators/concat-map"
import { async as everyAsync } from "../operators/every"
import { async as filterAsync } from "../operators/filter"
import { async as findAsync } from "../operators/find"
import { async as findLastAsync } from "../operators/find-last"
import { async as firstAsync } from "../operators/first"
import { async as groupByAsync } from "../operators/group-by"
import { async as includesAsync } from "../operators/includes"
import { async as lastAsync } from "../operators/last"
import { async as mapAsync } from "../operators/map"
import { async as maxByAsync } from "../operators/max-by"
import { async as minByAsync } from "../operators/min-by"
import { async as orderByAsync } from "../operators/order-by"
import { async as reduceAsync } from "../operators/reduce"
import { async as reverseAsync } from "../operators/reverse"
import { async as scanAsync } from "../operators/scan"
import { async as seqEqualsAsync } from "../operators/seq-equals"
import { async as setEqualsAsync } from "../operators/set-equals"
import { async as shuffleAsync } from "../operators/shuffle"
import { async as skipAsync } from "../operators/skip"
import { async as skipWhileAsync } from "../operators/skip-while"
import { async as someAsync } from "../operators/some"
import { async as sumByAsync } from "../operators/sum-by"
import { async as takeAsync } from "../operators/take"
import { async as takeWhileAsync } from "../operators/take-while"
import { async as toArrayAsync } from "../operators/to-array"
import { async as toMapAsync } from "../operators/to-map"
import { async as toSetAsync } from "../operators/to-set"
import { async as uniqAsync } from "../operators/uniq"
import { async as uniqByAsync } from "../operators/uniq-by"
import { async as windowAsync } from "../operators/window"
import { async as zipAsync } from "../operators/zip"
import { aseqSymbol } from "./symbol"

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
