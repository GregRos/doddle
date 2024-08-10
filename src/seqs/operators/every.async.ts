import type { LazyAsync } from "../../lazy/index.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import generic from "./every.js"

function every<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): LazyAsync<boolean> {
    return generic(every, aseq(this) as any, predicate as any) as any
}
export default every
