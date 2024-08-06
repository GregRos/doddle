import { mustBeFunction } from "../../errors/error.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

export interface TakeWhileSpecifier {
    takeFinal?: boolean
}
export function sync<T>(
    this: Iterable<T>,
    predicate: Seq.Predicate<T>,
    specifier?: TakeWhileSpecifier
): Seq<T> {
    mustBeFunction("predicate", predicate)
    return new SeqOperator(this, function* takeWhile(input) {
        let index = 0
        for (const element of input) {
            if (predicate(element, index++)) {
                yield element
            } else {
                if (specifier?.takeFinal) {
                    yield element
                }
                return
            }
        }
    }) as any
}
export function async<T>(
    this: AsyncIterable<T>,
    predicate: ASeq.Predicate<T>,
    specifier?: TakeWhileSpecifier
): ASeq<T> {
    mustBeFunction("predicate", predicate)
    return new ASeqOperator(this, async function* takeWhile(input) {
        let index = 0

        for await (const element of input) {
            if (await predicate(element, index++)) {
                yield element
            } else {
                if (specifier?.takeFinal) {
                    yield element
                }
                return
            }
        }
    }) as any
}
