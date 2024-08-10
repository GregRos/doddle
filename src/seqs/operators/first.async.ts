import type { LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
function first<T>(this: AsyncIterable<T>): LazyAsync<T | undefined>
function first<T, const Alt>(this: AsyncIterable<T>, alt: Alt): LazyAsync<T | Alt>
function first<T, const Alt = undefined>(this: AsyncIterable<T>, alt?: Alt) {
    return lazyFromOperator(this, async function first(input) {
        for await (const element of input) {
            return element
        }
        return alt
    })
}
export default first
