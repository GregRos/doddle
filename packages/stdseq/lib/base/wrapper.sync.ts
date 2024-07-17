import concatMap from "./operators/concat-map"
import zip from "./operators/zip"
import mapJoin from "./operators/map-join"
import dematerialize from "./operators/dematerialize"
import materialize from "./operators/materialize"
export abstract class Seq<T> implements Iterable<T> {
    readonly __TYPE__!: T;
    abstract [Symbol.iterator](): Iterator<T>
    concatMap = concatMap.sync
    zip = zip.sync
    mapJoin = mapJoin.sync
    dematerialize = dematerialize.sync
    materialize = materialize.sync
}

const s: Seq<number> = null!
