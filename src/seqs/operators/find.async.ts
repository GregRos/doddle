import type { LazyAsync } from "../../lazy/index.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import generic from "./find.js"

function find<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): LazyAsync<T | undefined>
function find<T, const Alt>(
    this: AsyncIterable<T>,
    predicate: ASeq.Predicate<T>,
    alt: Alt
): LazyAsync<T | Alt>
function find<T, Alt = T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>, alt?: Alt) {
    return generic(find, aseq(this) as any, predicate as any, alt) as any
}
export default find
