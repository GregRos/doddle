import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import { chk } from "../seq/load-checkers.js"

function getThrownError(thrown: unknown) {
    return thrown instanceof Error ? thrown : new Error(String(thrown))
}
function throws<T = never>(thrower: () => Error): ASeq<T> {
    thrower = chk(throws).thrower(thrower)
    return ASeqOperator(thrower, async function* throws(input) {
        const result = input()
        throw getThrownError(result)
    })
}
export default throws
