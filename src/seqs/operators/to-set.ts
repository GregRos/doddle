import { lazyFromOperator } from "../lazy-operator.js"

export function sync<T>(this: Iterable<T>) {
    return lazyFromOperator("toSet", this, input => {
        return new Set(input)
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return lazyFromOperator("toSet", this, async input => {
        const result = new Set<T>()
        for await (const element of input) {
            result.add(element)
        }
        return result
    })
}
