import { chk } from "../seq/_seq.js"
import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"

function getThrownError(thrown: unknown) {
    return thrown instanceof Error ? thrown : new Error(String(thrown))
}

export function sync<T = never>(throws: () => Error): Seq<T> {
    throws = chk(sync).throws(throws)
    return SeqOperator(throws, function* throws(input) {
        const result = input()
        throw getThrownError(result)
    })
}

export function async<T = never>(throws: () => Error): ASeq<T> {
    throws = chk(async).throws(throws)
    return ASeqOperator(throws, async function* throws(input) {
        const result = input()
        throw getThrownError(result)
    })
}
