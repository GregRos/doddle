import type { Lazy } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
function last<T>(this: Iterable<T>): Lazy<T | undefined>
function last<T, const Alt>(this: Iterable<T>, alt: Alt): Lazy<T | Alt>
function last<T, Alt = undefined>(this: Iterable<T>, alt?: Alt) {
    return lazyFromOperator(this, function last(input) {
        let last: T | Alt = alt as Alt
        for (const element of input) {
            last = element
        }
        return last
    })
}
export default last
