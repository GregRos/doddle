import type { LazyAsync } from "../../lazy/index.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import generic from "./count.js"

function count<T>(this: AsyncIterable<T>): LazyAsync<number>
function count<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): LazyAsync<number>
function count<T>(this: AsyncIterable<T>, predicate?: ASeq.Predicate<T>): LazyAsync<number> {
    return generic(count, aseq(this) as any, predicate as any) as any
}
export default count
