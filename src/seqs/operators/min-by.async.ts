import type { LazyAsync } from "../../lazy/index.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import generic from "./min-by.js"

function minBy<T, K>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, K>
): LazyAsync<T | undefined>
function minBy<T, K, const Alt>(
    this: AsyncIterable<T>,
    projection: ASeq.Iteratee<T, K>,
    alt?: Alt
): LazyAsync<T | Alt>
function minBy<T, K>(this: AsyncIterable<T>, projection: ASeq.Iteratee<T, K>, alt?: any) {
    return generic(minBy, aseq(this) as any, projection as any, alt)
}
export default minBy
