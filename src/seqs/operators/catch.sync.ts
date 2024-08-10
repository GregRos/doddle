import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { _iter } from "../../utils.js"
import { chk } from "../seq/_seq.js"
import { seq } from "../seq/seq.js"
function catch_<T, S>(this: Iterable<T>, handler: Seq.Iteratee<unknown, Seq.Input<S>>): Seq<T | S>
function catch_<T>(this: Iterable<T>, handler: Seq.Iteratee<unknown, void | undefined>): Seq<T>
function catch_<T, S>(
    this: Iterable<T>,
    handler: Seq.Iteratee<unknown, void | Seq.Input<S>>
): Seq<unknown> {
    chk(catch_).handler(handler)
    return SeqOperator(this, function* catch_(input) {
        let i = 0
        const iterator = _iter(input)
        for (;;) {
            try {
                const result = iterator.next()
                var value = result.value
                if (result.done) {
                    return
                }
                yield value
            } catch (err: any) {
                const error = err
                const result = handler(error, i)
                if (!result || result == null) {
                    return
                }
                yield* seq(result)
                return
            }
            i++
        }
    })
}
export default catch_
