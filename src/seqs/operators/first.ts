import { lazyFromOperator } from "../../lazy/lazy-operator"
import type { Lazy, LazyAsync } from "../../lazy"

export function sync<T>(this: Iterable<T>): Lazy<T | undefined>
export function sync<T, const Alt>(this: Iterable<T>, alt: Alt): Lazy<T | Alt>
export function sync<T, const Alt = undefined>(this: Iterable<T>, alt?: Alt): Lazy<any> {
    return lazyFromOperator("first", this, input => {
        for (const element of input) {
            return element
        }
        return alt
    })
}

export function async<T>(this: AsyncIterable<T>): LazyAsync<T | undefined>
export function async<T, const Alt>(this: AsyncIterable<T>, alt: Alt): LazyAsync<T | Alt>
export function async<T, const Alt = undefined>(this: AsyncIterable<T>, alt?: Alt) {
    return lazyFromOperator("first", this, async input => {
        for await (const element of input) {
            return element
        }
        return alt
    })
}
