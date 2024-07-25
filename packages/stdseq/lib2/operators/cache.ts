import { seq } from "../wrappers/seq.ctor"
import { aseq } from "../wrappers/aseq.ctor"
import { asyncFromOperator, lazyFromOperator, syncFromOperator } from "../from/operator"

export function sync<T>(this: Iterable<any>) {
    const self = this
    const cache: T[] = []
    let alreadyDone = false

    return syncFromOperator("cache", this, function* cache_() {
        let i = 0
        let iterator: Iterator<T>
        for (;;) {
            if (i < cache.length) {
                yield cache[i++]
            } else if (!alreadyDone) {
                iterator ??= self[Symbol.iterator]()
                const { done, value } = iterator.next()
                if (done) {
                    alreadyDone = true
                    return
                }
                cache.push(value)
                yield value
                i++
            } else {
                return
            }
        }
    })
}
export function async<T>(this: AsyncIterable<any>, index: number) {
    const self = this
    const cache: T[] = []
    let alreadyDone = false

    return asyncFromOperator("cache", this, async function* cache_() {
        let i = 0
        let iterator: AsyncIterator<T>
        for (;;) {
            if (i < cache.length) {
                yield cache[i++]
            } else if (!alreadyDone) {
                iterator ??= self[Symbol.asyncIterator]()
                const { done, value } = await iterator.next()
                if (done) {
                    alreadyDone = true
                    return
                }
                cache.push(value)
                yield value
                i++
            } else {
                return
            }
        }
    })
}
