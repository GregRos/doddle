import { lazyFromOperator } from "../lazy-operator.js"

export function sync<T>(this: Iterable<T>) {
    return lazyFromOperator(this, function toArray(input) {
        return [...input]
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return lazyFromOperator(this, async function toArray(input) {
        const result: T[] = []
        for await (const element of input) {
            result.push(element)
        }
        return result
    })
}
