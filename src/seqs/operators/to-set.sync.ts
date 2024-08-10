import { lazyFromOperator } from "../lazy-operator.js"
function toSet<T>(this: Iterable<T>) {
    return lazyFromOperator(this, function toSet(input) {
        return new Set(input)
    })
}
export default toSet
