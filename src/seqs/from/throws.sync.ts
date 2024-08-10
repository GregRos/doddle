import { chk } from "../seq/load-checkers.js"
import { SeqOperator, type Seq } from "../seq/seq.class.js"

function getThrownError(thrown: unknown) {
    return thrown instanceof Error ? thrown : new Error(String(thrown))
}
function throws<T = never>(thrower: () => Error): Seq<T> {
    thrower = chk(throws).thrower(thrower)
    return SeqOperator(thrower, function* throws(input) {
        const result = input()
        throw getThrownError(result)
    })
}
export default throws
