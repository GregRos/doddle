import type { LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
function last<T>(this: AsyncIterable<T>): LazyAsync<T | undefined>
function last<T, const Alt>(this: AsyncIterable<T>, alt: Alt): LazyAsync<T | Alt>
function last<T, Alt = undefined>(this: AsyncIterable<T>, alt?: Alt) {
    return lazyFromOperator(this, async function last(input) {
        let last: T | Alt = alt as Alt
        for await (const element of input) {
            last = element
        }
        return last as T | Alt
    })
}
export default last
