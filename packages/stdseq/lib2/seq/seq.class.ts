import { gotAsyncInSyncContext, gotNonIterable } from "../errors/error"
import type { SeqLikeInput } from "../f-types"
import { isAsyncIterable, isIterable, isThenable } from "../lazy"
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

export abstract class Seq<T> implements Iterable<T> {
    abstract [Symbol.iterator](): Iterator<T>
    get _qr() {
        return this.toArray().pull()
    }

    append = appendSync
    aseq = aseqSync
    at = atSync
    cache = cacheSync
    catch = catchSync
    concat = concatSync
    chunk = chunkSync
    concatMap = concatMapSync
    count = countSync
    each = eachSync
    every = everySync
    filter = filterSync
    findLast = findLastSync
    find = findSync
    first = firstSync
    flatMap = concatMapSync
    includes = includesSync
    last = lastSync
    map = mapSync

    maxBy = maxBySync
    minBy = minBySync
    orderBy = orderBySync
    reduce = reduceSync
    reverse = reverseSync
    scan = scanSync
    seqEquals = seqEqualsSync
    setEquals = setEqualsSync
    shuffle = shuffleSync
    skipWhile = skipWhileSync
    skip = skipSync
    some = someSync
    sumBy = sumBySync
    takeWhile = takeWhileSync
    take = takeSync
    toArray = toArraySync
    toSet = toSetSync
    toMap = toMapSync
    uniqBy = uniqBySync
    uniq = uniqSync
    window = windowSync
    zip = zipSync
}

export class SyncFromOperator<In, Out> extends Seq<Out> {
    [Symbol.iterator]!: () => Iterator<Out, any, undefined>
    constructor(
        readonly operator: string,
        private readonly _operand: In,
        private readonly _func: (input: In) => Iterable<Out>
    ) {
        super()
        this[Symbol.iterator] = () => this._func(this._operand)[Symbol.iterator]()
    }
}

export class FromSyncInput<T> extends Seq<T> {
    constructor(private readonly _input: SeqLikeInput<T>) {
        super()
    }

    *[Symbol.iterator](): Iterator<T, any, undefined> {
        const input = this._input
        if (typeof input === "function") {
            const result = input()
            if (isIterable(result)) {
                yield* result
            } else {
                for (;;) {
                    const obj = result.next()
                    if (isThenable(obj)) {
                        throw gotAsyncInSyncContext(result, "next function returned thenable")
                    }
                    const { done, value } = obj

                    if (done) {
                        return
                    }
                    yield value
                }
            }
        } else if (isIterable(input)) {
            yield* input
        } else if (isAsyncIterable(input)) {
            throw gotAsyncInSyncContext(input, "input only has Symbol.asyncIterator")
        } else {
            throw gotNonIterable(input, "sync", "not a function or sync iterable")
        }
    }
}
