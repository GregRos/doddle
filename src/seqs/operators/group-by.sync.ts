import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
function groupBy<T, K>(this: Iterable<T>, keyProjection: Seq.NoIndexIteratee<T, K>) {
    chk(groupBy).keyProjection(keyProjection)
    return lazyFromOperator(this, function groupBy(input) {
        const map = new Map<K, [T, ...T[]]>()
        for (const element of input) {
            const key = keyProjection(element)
            let group = map.get(key)
            if (!group) {
                group = [element]
                map.set(key, group)
            } else {
                group.push(element)
            }
        }
        return map
    })
}
export default groupBy
