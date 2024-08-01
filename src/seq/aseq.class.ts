import { async as appendAsync } from "../operators/append"
import { async as atAsync } from "../operators/at"
import { async as cacheAsync } from "../operators/cache"
import { async as concatAsync } from "../operators/concat"
import { async as countAsync } from "../operators/count"
import { async as eachAsync } from "../operators/each"

import { gotNonIterable } from "../errors/error"
import type { ASeqLikeInput } from "../f-types"
import { isAsyncIterable, isIterable, isNextable } from "../lazy"
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

export abstract class ASeq<T> implements AsyncIterable<T> {
    __T!: T;

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

async function fromFunction<T>(func: () => any) {
    return async function* () {
        const result = func()
        if (isAsyncIterable(result)) {
            yield* result
        } else if (isIterable(result)) {
            yield* result
        } else if (isNextable(result)) {
            for (let item = await result.next(); !item.done; item = await result.next()) {
                yield item.value
            }
        } else {
            throw gotNonIterable(
                result,
                "async",
                "it was a function that did not return an iterable or iterator"
            )
        }
    }
}

export class FromAsyncInput<T> extends ASeq<T> {
    constructor(private readonly _input: ASeqLikeInput<T>) {
        super()
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T, any, undefined> {
        const items = await this._input
        if (isAsyncIterable(items)) {
            yield* items
        } else if (isIterable(items)) {
            yield* items
        } else if (typeof items === "function") {
            const result = items()
            if (isAsyncIterable(result)) {
                yield* result
            } else if (isIterable(result)) {
                yield* result
            } else if (isNextable(result)) {
                for (let item = await result.next(); !item.done; item = await result.next()) {
                    yield item.value
                }
            } else {
                throw gotNonIterable(
                    items,
                    "async",
                    "it was a function that did not return an iterable or iterator"
                )
            }
        } else {
        }
    }
}

export class AsyncFromOperator<In, Out> extends ASeq<Out> {
    [Symbol.asyncIterator]!: () => AsyncIterator<Out, any, undefined>
    constructor(
        readonly operator: string,
        private readonly _operand: AsyncIterable<In>,
        private readonly _func: (input: AsyncIterable<In>) => AsyncIterable<Out>
    ) {
        super()
        this[Symbol.asyncIterator] = () => this._func(this._operand)[Symbol.asyncIterator]()
    }
}
