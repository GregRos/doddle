import _at from "./operators/at"
import _count from "./operators/count"
import _each from "./operators/each"
import _every from "./operators/every"
import _filter from "./operators/filter"
import _find from "./operators/find"
import _findLast from "./operators/find-last"
import _first from "./operators/first"
import _flatMap from "./operators/flat-map"
import _includes from "./operators/includes"
import _last from "./operators/last"
import _map from "./operators/map"
import _maxBy from "./operators/max-by"
import _minBy from "./operators/min-by"
import _orderBy from "./operators/order-by"
import _pairwise from "./operators/pairwise"
import _reduce from "./operators/reduce"
import _scan from "./operators/scan"
import _seqEquals from "./operators/seq-equals"
import _setEquals from "./operators/set-equals"
import _skip from "./operators/skip"
import _skipLast from "./operators/skip-last"
import _skipWhile from "./operators/skip-while"
import _some from "./operators/some"
import _sumBy from "./operators/sum-by"
import _take from "./operators/take"
import _takeLast from "./operators/take-last"
import _takeWhile from "./operators/take-while"
import _toArray from "./operators/to-array"
import _toMap from "./operators/to-map"
import _toSet from "./operators/to-set"
import _uniq from "./operators/uniq"
import _uniqBy from "./operators/uniq-by"
import _windowed from "./operators/windowed"
import _zip from "./operators/zip"

export abstract class Seq<T> implements Iterable<T> {
    abstract [Symbol.iterator](): Iterator<T>
    at = _at.sync
    // cache
    count = _count.sync
    each = _each.sync
    every = _every.sync
    filter = _filter.sync
    findLast = _findLast.sync
    find = _find.sync
    first = _first.sync
    flatMap = _flatMap.sync
    includes = _includes.sync
    last = _last.sync
    map = _map.sync

    maxBy = _maxBy.sync
    minBy = _minBy.sync
    orderBy = _orderBy.sync
    pairwise = _pairwise.sync
    reduce = _reduce.sync
    scan = _scan.sync
    seqEquals = _seqEquals.sync
    setEquals = _setEquals.sync
    skipLast = _skipLast.sync
    skipWhile = _skipWhile.sync
    skip = _skip.sync
    some = _some.sync
    sumBy = _sumBy.sync
    takeLast = _takeLast.sync
    takeWhile = _takeWhile.sync
    take = _take.sync
    toArray = _toArray.sync
    toSet = _toSet.sync
    toMap = _toMap.sync
    uniqBy = _uniqBy.sync
    uniq = _uniq.sync
    windowed = _windowed.sync
    zip = _zip.sync
}

export abstract class ASeq<T> implements AsyncIterable<T> {
    abstract [Symbol.asyncIterator](): AsyncIterator<T>

    at = _at.async
    // cache
    count = _count.async
    each = _each.async
    every = _every.async
    filter = _filter.async
    findLast = _findLast.async
    find = _find.async
    first = _first.async
    flatMap = _flatMap.async
    includes = _includes.async
    last = _last.async
    map = _map.async

    maxBy = _maxBy.async
    minBy = _minBy.async
    orderBy = _orderBy.async
    pairwise = _pairwise.async
    reduce = _reduce.async
    scan = _scan.async
    seqEquals = _seqEquals.async
    setEquals = _setEquals.async
    skipLast = _skipLast.async
    skipWhile = _skipWhile.async
    skip = _skip.async
    some = _some.async
    sumBy = _sumBy.async
    takeLast = _takeLast.async
    takeWhile = _takeWhile.async
    take = _take.async
    toArray = _toArray.async
    toSet = _toSet.async
    toMap = _toMap.async
    uniqBy = _uniqBy.async
    uniq = _uniq.async
    windowed = _windowed.async
    zip = _zip.async
}
