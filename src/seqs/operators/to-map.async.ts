import type { LazyAsync } from "../../lazy/index.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import generic from "./to-map.js"

function toMap<T, K, V>(
    this: AsyncIterable<T>,
    kvpProjection: ASeq.Iteratee<T, readonly [K, V]>
): LazyAsync<Map<K, V>> {
    return generic(toMap, aseq(this) as any, kvpProjection as any) as any
}
export default toMap
