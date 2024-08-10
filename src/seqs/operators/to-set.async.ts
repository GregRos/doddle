import { lazyFromOperator } from "../lazy-operator.js"
function toSet<T>(this: AsyncIterable<T>) {
    return lazyFromOperator(this, async function toSet(input) {
        const result = new Set<T>()
        for await (const element of input) {
            result.add(element)
        }
        return result
    })
}
export default toSet
