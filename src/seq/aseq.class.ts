import { async as appendAsync } from "../operators/append"
import { async as atAsync } from "../operators/at"
import { async as cacheAsync } from "../operators/cache"
import { async as concatAsync } from "../operators/concat"
import { async as countAsync } from "../operators/count"
import { async as eachAsync } from "../operators/each"

import { gotNonIterable } from "../errors/error"
import { isAsyncIterable, isIterable, isNextable, type Pulled } from "../lazy"
import { async as catchAsync } from "../operators/catch"
import { async as chunkAsync } from "../operators/chunk"

import { async as concatMapAsync } from "../operators/concat-map"
import { async as everyAsync } from "../operators/every"
import { async as filterAsync } from "../operators/filter"
import { async as findAsync } from "../operators/find"
import { async as findLastAsync } from "../operators/find-last"
import { async as firstAsync } from "../operators/first"
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
import type { aseq } from "./aseq.ctor"

export abstract class ASeq<T> implements AsyncIterable<T> {
    abstract [Symbol.asyncIterator](): AsyncIterator<T>
    get _qr() {
        return this.toArray().pull()
    }
    append = appendAsync
    at = atAsync
    catch = catchAsync
    concat = concatAsync
    concatMap = concatMapAsync
    chunk = chunkAsync
    cache = cacheAsync
    count = countAsync
    each = eachAsync
    every = everyAsync
    filter = filterAsync
    findLast = findLastAsync
    find = findAsync
    first = firstAsync
    flatMap = concatMapAsync
    includes = includesAsync
    last = lastAsync
    map = mapAsync
    maxBy = maxByAsync
    minBy = minByAsync
    orderBy = orderByAsync
    reduce = reduceAsync
    reverse = reverseAsync
    scan = scanAsync
    seqEquals = seqEqualsAsync
    setEquals = setEqualsAsync
    shuffle = shuffleAsync

    skipWhile = skipWhileAsync
    skip = skipAsync
    some = someAsync
    sumBy = sumByAsync
    takeWhile = takeWhileAsync
    take = takeAsync
    toArray = toArrayAsync
    toSet = toSetAsync
    toMap = toMapAsync
    uniqBy = uniqByAsync
    uniq = uniqAsync
    window = windowAsync
    zip = zipAsync
}
let namedInvokerStubs: Record<string, () => Iterable<any>> = {}

function getInvokerStub(name: string) {
    if (!namedInvokerStubs[name]) {
        Object.assign(namedInvokerStubs, {
            [name]: async function* (this: ASyncOperator<any, any>) {
                yield* this._impl(this._operand)
            }
        })
    }
    return namedInvokerStubs[name]
}

interface ASyncOperator<In, Out> extends AsyncIterable<Out> {
    _operator: string
    _operand: In
    _impl: (input: In) => AsyncIterable<Out>
}

export const asyncOperator = function asyncOperator<In, Out>(
    this: ASyncOperator<In, Out>,
    operator: string,
    operand: In,
    impl: (input: In) => AsyncIterable<Out>
) {
    this._operator = operator
    this._operand = operand
    this._impl = impl

    this[Symbol.asyncIterator] = getInvokerStub(operator) as any
} as any as {
    new <In, Out>(operator: string, operand: In, impl: (input: In) => AsyncIterable<Out>): ASeq<Out>
}
asyncOperator.prototype = new (ASeq as any)()

export namespace ASeq {
    type MaybePromise<T> = T | PromiseLike<T>

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
