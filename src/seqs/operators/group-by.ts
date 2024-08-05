import { lazyFromOperator } from "../lazy-operator"
import type { ASeq } from "../seq/aseq.class"
import type { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

export function sync<T, K>(this: Iterable<T>, keyProjection: Seq.NoIndexIteratee<T, K>) {
    return lazyFromOperator("groupBy", this, input => {
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
    return lazyFromOperator("groupBy", this, async input => {
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
