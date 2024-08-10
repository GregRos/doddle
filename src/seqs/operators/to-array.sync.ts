import { lazyFromOperator } from "../lazy-operator.js"
function toArray<T>(this: Iterable<T>) {
    return lazyFromOperator(this, function toArray(input) {
        return [...input]
    })
}
export default toArray
