import { seq } from "../wrappers/seq.ctor"
import { lazyFromOperator } from "../from/operator"
import { mustBeInteger, mustBeNatural } from "../errors/error"
import { aseq } from "../wrappers/aseq.ctor"
import type { AsyncIteratee, Iteratee } from "../f-types"

export function sync<T, K>(this: Iterable<T>, keyProjection: Iteratee<T, K>) {
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

export function async<T, K>(this: AsyncIterable<T>, keyProjection: AsyncIteratee<T, K>) {
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
