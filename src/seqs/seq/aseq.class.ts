import append from "../operators/append.async.js"
import at from "../operators/at.async.js"
import cache from "../operators/cache.async.js"
import concat from "../operators/concat.async.js"
import count from "../operators/count.async.js"
import each from "../operators/each.async.js"

import catch_ from "../operators/catch.async.js"
import chunk from "../operators/chunk.async.js"

import { _aiter } from "../../utils.js"
import concatMap from "../operators/concat-map.async.js"
import every from "../operators/every.async.js"
import filter from "../operators/filter.async.js"
import findLast from "../operators/find-last.async.js"
import find from "../operators/find.async.js"
import first from "../operators/first.async.js"
import groupBy from "../operators/group-by.async.js"
import includes from "../operators/includes.async.js"
import last from "../operators/last.async.js"
import map from "../operators/map.async.js"
import maxBy from "../operators/max-by.async.js"
import minBy from "../operators/min-by.async.js"
import orderBy from "../operators/order-by.async.js"
import reduce from "../operators/reduce.async.js"
import reverse from "../operators/reverse.async.js"
import scan from "../operators/scan.async.js"
import seqEquals from "../operators/seq-equals.async.js"
import setEquals from "../operators/set-equals.async.js"
import shuffle from "../operators/shuffle.async.js"
import skipWhile from "../operators/skip-while.async.js"
import skip from "../operators/skip.async.js"
import some from "../operators/some.async.js"
import sumBy from "../operators/sum-by.async.js"
import takeWhile from "../operators/take-while.async.js"
import take from "../operators/take.async.js"
import toArray from "../operators/to-array.async.js"
import toMap from "../operators/to-map.async.js"
import toSet from "../operators/to-set.async.js"
import uniqBy from "../operators/uniq-by.async.js"
import uniq from "../operators/uniq.async.js"
import window from "../operators/window.async.js"
import zip from "../operators/zip.async.js"
import { _Seq } from "./_seq.js"
import { aseqSymbol } from "./symbol.js"

export abstract class ASeq<T> extends _Seq implements AsyncIterable<T> {
    constructor() {
        super()
        this.loadCheckers()
    }
    abstract [Symbol.asyncIterator](): AsyncIterator<T>
    get _qr() {
        return this.toArray().pull()
    }
    readonly [aseqSymbol] = true
    readonly append = append
    readonly at = at
    readonly catch = catch_
    readonly concat = concat
    readonly concatMap = concatMap
    readonly chunk = chunk
    readonly cache = cache
    readonly count = count
    readonly each = each
    readonly every = every
    readonly filter = filter
    readonly findLast = findLast
    readonly find = find
    readonly first = first
    readonly flatMap = concatMap
    readonly groupBy = groupBy
    readonly includes = includes
    readonly last = last
    readonly map = map
    readonly maxBy = maxBy
    readonly minBy = minBy
    readonly orderBy = orderBy
    readonly reduce = reduce
    readonly reverse = reverse
    readonly scan = scan
    readonly seqEquals = seqEquals
    readonly setEquals = setEquals
    readonly shuffle = shuffle
    readonly skipWhile = skipWhile
    readonly skip = skip
    readonly some = some
    readonly sumBy = sumBy
    readonly takeWhile = takeWhile
    readonly take = take
    readonly toArray = toArray
    readonly toSet = toSet
    readonly toMap = toMap
    readonly uniqBy = uniqBy
    readonly uniq = uniq
    readonly window = window
    readonly zip = zip
}

let baseASeq!: ASeq<any>
export const ASeqOperator = function aseq<In, Out>(
    operand: In,
    impl: (input: In) => AsyncIterable<Out>
): ASeq<Out> {
    if (!baseASeq) {
        baseASeq = new (ASeq as any)()
    }
    const obj = Object.create(baseASeq)
    return Object.assign(obj, {
        _operator: impl.name,
        _operand: operand,
        [Symbol.asyncIterator]: function operator() {
            return _aiter(impl.call(this, this._operand))
        }
    })
}

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
