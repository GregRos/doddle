import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
function concat<T, Seqs extends Seq.Input<any>[]>(
    this: Iterable<T>,
    ..._iterables: Seqs
): Seq<T | Seq.ElementOfInput<Seqs[number]>> {
    const iterables = _iterables.map(seq)
    return SeqOperator(this, function* concat(input) {
        yield* input
        for (const iterable of iterables) {
            yield* iterable
        }
    }) as any
}
export default concat
