import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"

export function sync<T, K>(this: Iterable<T>, keyProjection: Seq.NoIndexIteratee<T, K>) {
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

export function async<T, K>(this: AsyncIterable<T>, keyProjection: ASeq.NoIndexIteratee<T, K>) {
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
