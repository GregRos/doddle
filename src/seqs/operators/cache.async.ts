import { _aiter } from "../../utils.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"

class ThrownErrorMarker {
    constructor(public error: any) {}
}
function cache<T>(this: AsyncIterable<T>): ASeq<T> {
    const self = this
    const _cache: (T | ThrownErrorMarker)[] = []
    let alreadyDone = false
    let iterator: AsyncIterator<T>
    let pending: Promise<void> | undefined
    return ASeqOperator(this, async function* cache() {
        let i = 0
        for (;;) {
            if (i < _cache.length) {
                const cur = _cache[i]
                if (cur instanceof ThrownErrorMarker) {
                    throw cur.error
                }
                yield cur
                i++
            } else if (!alreadyDone) {
                iterator ??= _aiter(self)
                if (!pending) {
                    pending = (async () => {
                        try {
                            const { done, value } = await iterator.next()
                            if (done) {
                                alreadyDone = true
                                return
                            }
                            _cache.push(value)
                            pending = undefined
                            return
                        } catch (err) {
                            _cache.push(new ThrownErrorMarker(err as any))
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
export default cache
