import { mustNotBeNullish, mustNotReturnNullish, type mustReturnTuple } from "../../errors/error"
import { ASeqOperator, type ASeq } from "../seq/aseq.class"
import { SeqOperator, type Seq } from "../seq/seq.class"

function getThrownError(thrown: unknown) {
    mustNotReturnNullish("thrown", thrown)
    return thrown instanceof Error ? thrown : new Error(String(thrown))
}

export function sync<T = never>(thrown: unknown): Seq<T> {
    mustNotBeNullish("thrown", thrown)
    return new SeqOperator("fromError", thrown, function* (input) {
        if (typeof input === "function") {
            const result = input()
            mustNotReturnNullish("thrown", result)
            throw getThrownError(result)
        }
        throw getThrownError(input)
    })
}

export function async<T>(
    thrown: string | Error | (() => string | Error | Promise<string> | Promise<Error>)
): ASeq<T> {
    mustNotBeNullish("thrown", thrown)
    return new ASeqOperator("fromError", thrown, async function* (input) {
        if (typeof input === "function") {
            const result = input()
            mustNotReturnNullish("thrown", result)
            throw getThrownError(result)
        }
        throw getThrownError(input)
    })
}
