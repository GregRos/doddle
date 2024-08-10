import type { Seq } from "../seq/seq.class.js"
import generic from "./to-map.js"

import { seq } from "../seq/seq.js"

function toMap<T, K, V>(this: Iterable<T>, kvpProjection: Seq.Iteratee<T, readonly [K, V]>) {
    return generic(toMap, seq(this), kvpProjection)
}
export default toMap
