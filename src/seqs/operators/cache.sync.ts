import { _iter } from "../../utils.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

class ThrownErrorMarker {
    constructor(public error: any) {}
}
function cache<T>(this: Iterable<T>): Seq<T> {
    const self = this
    const _cache: (T | ThrownErrorMarker)[] = []
    let alreadyDone = false
    let iterator: Iterator<T>

    return SeqOperator(this, function* cache() {
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
                iterator ??= _iter(self)
                try {
                    const { done, value } = iterator.next()
                    if (done) {
                        alreadyDone = true
                        return
                    }
                    _cache.push(value)
                    yield value
                    i++
                } catch (err) {
                    _cache.push(new ThrownErrorMarker(err as any))
                    throw err
                }
            } else {
                return
            }
        }
    })
}
export default cache
