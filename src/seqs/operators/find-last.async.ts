import type { LazyAsync } from "../../lazy/index.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import generic from "./find-last.js"

function findLast<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): LazyAsync<T | undefined>
function findLast<T, const Alt>(
    this: AsyncIterable<T>,
    predicate: ASeq.Predicate<T>,
    alt: Alt
): LazyAsync<T | Alt>
function findLast<T, Alt = T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>, alt?: Alt) {
    return generic(findLast, aseq(this) as any, predicate as any, alt)
}
export default findLast
