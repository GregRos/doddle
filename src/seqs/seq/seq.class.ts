import { _iter } from "../../utils.js"
import append from "../operators/append.sync.js"
import at from "../operators/at.sync.js"
import cache from "../operators/cache.sync.js"
import catch_ from "../operators/catch.sync.js"
import chunk from "../operators/chunk.sync.js"
import concatMap from "../operators/concat-map.sync.js"
import concat from "../operators/concat.sync.js"
import count from "../operators/count.sync.js"
import each from "../operators/each.sync.js"
import every from "../operators/every.sync.js"
import filter from "../operators/filter.sync.js"
import findLast from "../operators/find-last.sync.js"
import find from "../operators/find.sync.js"
import first from "../operators/first.sync.js"
import groupBy from "../operators/group-by.sync.js"
import includes from "../operators/includes.sync.js"
import last from "../operators/last.sync.js"
import map from "../operators/map.sync.js"
import maxBy from "../operators/max-by.sync.js"
import minBy from "../operators/min-by.sync.js"
import orderBy from "../operators/order-by.sync.js"
import reduce from "../operators/reduce.sync.js"
import reverse from "../operators/reverse.sync.js"
import scan from "../operators/scan.sync.js"
import seqEquals from "../operators/seq-equals.sync.js"
import setEquals from "../operators/set-equals.sync.js"
import shuffle from "../operators/shuffle.sync.js"
import skipWhile from "../operators/skip-while.sync.js"
import skip from "../operators/skip.sync.js"
import some from "../operators/some.sync.js"
import sumBy from "../operators/sum-by.sync.js"
import takeWhile from "../operators/take-while.sync.js"
import take from "../operators/take.sync.js"
import toArray from "../operators/to-array.sync.js"
import toMap from "../operators/to-map.sync.js"
import toSet from "../operators/to-set.sync.js"
import uniqBy from "../operators/uniq-by.sync.js"
import uniq from "../operators/uniq.sync.js"
import window from "../operators/window.sync.js"
import zip from "../operators/zip.sync.js"
import { _Seq } from "./_seq.js"
import { seqSymbol } from "./symbol.js"

export abstract class Seq<T> extends _Seq implements Iterable<T> {
    abstract [Symbol.iterator](): Iterator<T>
    constructor() {
        super()
        this.loadCheckers()
    }
    get _qr() {
        return this.toArray().pull()
    }
    readonly [seqSymbol] = true
    readonly append = append
    readonly at = at
    readonly cache = cache
    readonly catch = catch_
    readonly concat = concat
    readonly chunk = chunk
    readonly concatMap = concatMap
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
