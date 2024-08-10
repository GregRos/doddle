import { lazyFromOperator } from "../lazy-operator.js"
function toArray<T>(this: AsyncIterable<T>) {
    return lazyFromOperator(this, async function toArray(input) {
        const result: T[] = []
        for await (const element of input) {
            result.push(element)
        }
        return result
    })
}
export default toArray
