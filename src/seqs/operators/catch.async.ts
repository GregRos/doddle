import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

import { _aiter } from "../../utils.js"
import { chk } from "../seq/_seq.js"
function catch_<T, S>(
    this: AsyncIterable<T>,
    handler: ASeq.Iteratee<unknown, ASeq.SimpleInput<S>>
): ASeq<T | S>
function catch_<T>(this: AsyncIterable<T>, handler: ASeq.Iteratee<unknown, void>): ASeq<T>
function catch_<T, S>(
    this: AsyncIterable<T>,
    handler: ASeq.Iteratee<unknown, void | ASeq.SimpleInput<S>>
): ASeq<any> {
    chk(catch_).handler(handler)
    return ASeqOperator(this, async function* catch_(input) {
        let i = 0
        const iterator = _aiter(input)
        for (;;) {
            try {
                const result = await iterator.next()
                var value = result.value
                if (result.done) {
                    return
                }
                yield value
            } catch (err: any) {
                const error = err
                const result = await handler(error, i)
                if (!result || result == null) {
                    return
                }
                yield* aseq(result)
                return
            }
            i++
        }
    })
}
export default catch_
