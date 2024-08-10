import { lazyFromOperator } from "../lazy-operator.js"
import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
function groupBy<T, K>(this: AsyncIterable<T>, keyProjection: ASeq.NoIndexIteratee<T, K>) {
    chk(groupBy).keyProjection(keyProjection)
    return lazyFromOperator(this, async function groupBy(input) {
        const map = new Map<K, [T, ...T[]]>()
        for await (const element of input) {
            const key = await keyProjection(element)
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
