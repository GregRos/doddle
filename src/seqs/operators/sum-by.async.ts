import type { LazyAsync } from "../../lazy/index.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import generic from "./sum-by.js"

function sumBy<T>(this: AsyncIterable<T>, projection: ASeq.Iteratee<T, number>): LazyAsync<number> {
    return generic(sumBy, aseq(this) as any, projection as any) as any
}
export default sumBy
