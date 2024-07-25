import { async as atAsync } from "../operators/at"
import { async as appendAsync } from "../operators/append"
import { async as sampleAsync } from "../operators/sample"
import { async as cacheAsync } from "../operators/cache"
import { async as countAsync } from "../operators/count"
import { async as concatAsync } from "../operators/concat"
import { async as eachAsync } from "../operators/each"
import { async as nonNullishAsync } from "../operators/non-nullish"

import { async as everyAsync } from "../operators/every"
import { async as concatMapAsync } from "../operators/concat-map"
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
import { async as pairwiseAsync } from "../operators/pairwise"
import { async as reduceAsync } from "../operators/reduce"
import { async as scanAsync } from "../operators/scan"
import { async as seqEqualsAsync } from "../operators/seq-equals"
import { async as setEqualsAsync } from "../operators/set-equals"
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
import { async as shuffleAsync } from "../operators/shuffle"
import { async as chunkAsync } from "../operators/chunk"

export abstract class ASeq<T> implements AsyncIterable<T> {
    __T!: T;

    abstract [Symbol.asyncIterator](): AsyncIterator<T>
    get _qr() {
        return this.toArray().pull()
    }
    append = appendAsync
    at = atAsync
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
    nonNullish = nonNullishAsync
    maxBy = maxByAsync
    minBy = minByAsync
    orderBy = orderByAsync
    pairwise = pairwiseAsync
    reduce = reduceAsync
    sample = sampleAsync
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
