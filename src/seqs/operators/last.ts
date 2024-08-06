import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"

export function sync<T>(this: Iterable<T>): Lazy<T | undefined>
export function sync<T, const Alt>(this: Iterable<T>, alt: Alt): Lazy<T | Alt>
export function sync<T, Alt = undefined>(this: Iterable<T>, alt?: Alt) {
    return lazyFromOperator("last", this, input => {
        let last: T | Alt = alt as Alt
        for (const element of input) {
            last = element
        }
        return last
    })
}
export function async<T>(this: AsyncIterable<T>): LazyAsync<T | undefined>
export function async<T, const Alt>(this: AsyncIterable<T>, alt: Alt): LazyAsync<T | Alt>
export function async<T, Alt = undefined>(this: AsyncIterable<T>, alt?: Alt) {
    return lazyFromOperator("last", this, async input => {
        let last: T | Alt = alt as Alt
        for await (const element of input) {
            last = element
        }
        return last as T | Alt
    })
}
