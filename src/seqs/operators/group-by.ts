import { aseq, seq, type Lazy, type LazyAsync } from "../../index.js"
import { returnKvp } from "../../utils.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"

function compute<T, K>(input: Seq<T>, keyProjection: Seq.NoIndexIteratee<T, K>) {
    const map = new Map<K, [T, ...T[]]>()
    return input
        .map(element => {
            return returnKvp(input, keyProjection(element), element) as any
        })
        .reduce((map, { key, value }) => {
            let group = map.get(key)
            if (!group) {
                group = [value]
                map.set(key, group)
            } else {
                group.push(value)
            }
            return map
        }, map)
        .pull()
}

export function sync<T, K>(
    this: Iterable<T>,
    keyProjection: Seq.NoIndexIteratee<T, K>
): Lazy<Map<K, [T, ...T[]]>> {
    return lazyFromOperator(this, function groupBy(input) {
        return compute(seq(input), keyProjection)
    })
}

export function async<T, K>(
    this: AsyncIterable<T>,
    keyProjection: ASeq.NoIndexIteratee<T, K>
): LazyAsync<Map<K, [T, ...T[]]>> {
    return lazyFromOperator(this, async function groupBy(input) {
        return compute(aseq(input) as any, keyProjection) as any
    })
}
