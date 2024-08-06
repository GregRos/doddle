import { checkThrows, checkThrowsReturn } from "../../errors/error.js"
import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"

function getThrownError(thrown: unknown) {
    checkThrowsReturn(thrown)
    return thrown instanceof Error ? thrown : new Error(String(thrown))
}

export function sync<T = never>(thrown: unknown): Seq<T> {
    checkThrows(thrown)
    return SeqOperator(thrown, function* throws(input) {
        if (typeof input === "function") {
            const result = input()
            throw getThrownError(result)
        }
        throw getThrownError(input)
    })
}

export function async<T = never>(thrown: unknown): ASeq<T> {
    checkThrows(thrown)
    return ASeqOperator(thrown, async function* throws(input) {
        if (typeof input === "function") {
            const result = input()
            throw getThrownError(result)
        }
        throw getThrownError(input)
    })
}
