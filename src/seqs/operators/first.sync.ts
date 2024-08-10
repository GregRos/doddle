import type { Lazy } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
function first<T>(this: Iterable<T>): Lazy<T | undefined>
function first<T, const Alt>(this: Iterable<T>, alt: Alt): Lazy<T | Alt>
function first<T, const Alt = undefined>(this: Iterable<T>, alt?: Alt): Lazy<any> {
    return lazyFromOperator(this, function first(input) {
        for (const element of input) {
            return element
        }
        return alt
    })
}
export default first
