import { aseq, seq } from "../ctors"
import { asyncFromOperator, lazyFromOperator, syncFromOperator } from "../from/operator"
import _find from "./find"

const _cache = {
    name: "cache",
    sync<T>(this: Iterable<any>, index: number) {
        const self = this
        const cache: T[] = []
        let alreadyDone = false

        return syncFromOperator(_cache, this, function* cache_() {
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
    },
    async<T>(this: AsyncIterable<any>, index: number) {
        const self = this
        const cache: T[] = []
        let alreadyDone = false

        return asyncFromOperator(_cache, this, async function* cache_() {
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
}

export default _cache
