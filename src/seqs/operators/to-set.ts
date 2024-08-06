import { lazyFromOperator } from "../lazy-operator.js"

export function sync<T>(this: Iterable<T>) {
    return lazyFromOperator(this, function toSet(input) {
        return new Set(input)
    })
}
export function async<T>(this: AsyncIterable<T>) {
    return lazyFromOperator(this, async function toSet(input) {
        const result = new Set<T>()
        for await (const element of input) {
            result.add(element)
        }
        return result
    })
}
