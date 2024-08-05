import { lazyFromOperator } from "../lazy-operator"
import type { ASeq } from "../seq/aseq.class"
import type { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

export function sync<T, K>(this: Iterable<T>, keyProjection: Seq.Iteratee<T, K>) {
    return lazyFromOperator("groupBy", this, input => {
        const map = new Map<K, T[]>()
        let index = 0
        for (const element of input) {
            const key = keyProjection(element, index++)
            let group = map.get(key)
            if (!group) {
                group = []
                map.set(key, group)
            }
        }
        return map
    })
}

export function async<T, K>(this: AsyncIterable<T>, keyProjection: ASeq.Iteratee<T, K>) {
    return lazyFromOperator("groupBy", this, async input => {
        const map = new Map<K, T[]>()
        let index = 0
        for await (const element of input) {
            const key = await keyProjection(element, index++)
            let group = map.get(key)
            if (!group) {
                group = []
                map.set(key, group)
            }
        }
        return map
    })
}
