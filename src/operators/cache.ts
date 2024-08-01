import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

class ThrownErrorMarker {
    constructor(public error: any) {}
}
export function sync<T>(this: Iterable<T>): Seq<T> {
    const self = this
    const cache: (T | ThrownErrorMarker)[] = []
    let alreadyDone = false
    let iterator: Iterator<T>

    return new syncOperator("cache", this, function* cache_() {
        let i = 0
        for (;;) {
            if (i < cache.length) {
                const cur = cache[i]
                if (cur instanceof ThrownErrorMarker) {
                    throw cur.error
                }
                yield cur
                i++
            } else if (!alreadyDone) {
                iterator ??= self[Symbol.iterator]()
                try {
                    const { done, value } = iterator.next()
                    if (done) {
                        alreadyDone = true
                        return
                    }
                    cache.push(value)
                    yield value
                    i++
                } catch (err) {
                    cache.push(new ThrownErrorMarker(err as any))
                    throw err
                }
            } else {
                return
            }
        }
    })
}
export function async<T>(this: AsyncIterable<T>): ASeq<T> {
    const self = this
    const cache: (T | ThrownErrorMarker)[] = []
    let alreadyDone = false
    let iterator: AsyncIterator<T>
    let pending: Promise<void> | undefined
    return new asyncOperator("cache", this, async function* cache_() {
        let i = 0
        for (;;) {
            if (i < cache.length) {
                const cur = cache[i]
                if (cur instanceof ThrownErrorMarker) {
                    throw cur.error
                }
                yield cur
                i++
            } else if (!alreadyDone) {
                iterator ??= self[Symbol.asyncIterator]()
                if (!pending) {
                    pending = (async () => {
                        try {
                            const { done, value } = await iterator.next()
                            if (done) {
                                alreadyDone = true
                                return
                            }
                            cache.push(value)
                            pending = undefined
                            return
                        } catch (err) {
                            cache.push(new ThrownErrorMarker(err as any))
                            pending = undefined
                            return
                        }
                    })()
                }
                await pending
            } else {
                return
            }
        }
    })
}
