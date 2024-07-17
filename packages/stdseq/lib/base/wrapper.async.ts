import concatMap from "./operators/concat-map"
import dematerialize from "./operators/dematerialize"
import mapJoin from "./operators/map-join"
import zip from "./operators/zip"
export abstract class ASeq<T> implements AsyncIterable<T> {
    readonly __TYPE__!: T;
    abstract [Symbol.asyncIterator](): AsyncIterator<T>
    concatMap = concatMap.async
    zip = zip.async
    mapJoin = mapJoin.async
    dematerialize = dematerialize.async
    materialize = dematerialize.sync
}

const s: ASeq<number> = null!

s.concatMap(x => [1])
