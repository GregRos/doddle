import { mustBeFunction, mustBeOneOf } from "../../errors/error"
import { ASeqOperator, type ASeq } from "../seq/aseq.class"
import { SeqOperator } from "../seq/seq.class"
import type { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
export type EachCallStage = "before" | "after" | "both" | undefined
const mustBeStage = mustBeOneOf("before", "after", "both", undefined)
export function sync<T>(
    this: Iterable<T>,
    action: Seq.StageIteratee<T, void>,
    stage: EachCallStage = "before"
) {
    mustBeFunction("action", action)
    mustBeStage("stage", stage)
    stage ??= "before"
    return new SeqOperator("each", this, function* (input) {
        let index = 0
        for (const element of input) {
            if (stage === "before" || stage === "both") {
                action(element, index, "before")
            }
            yield element
            if (stage === "after" || stage === "both") {
                action(element, index, "after")
            }
            index++
        }
    })
}
export function async<T>(
    this: AsyncIterable<T>,
    action: ASeq.StageIteratee<T, void>,
    stage: EachCallStage = "before"
) {
    mustBeFunction("action", action)
    mustBeStage("stage", stage)
    stage ??= "before"
    return new ASeqOperator("each", this, async function* (input) {
        let index = 0
        for await (const element of input) {
            if (stage === "before" || stage === "both") {
                await action(element, index, "before")
            }
            yield element
            if (stage === "after" || stage === "both") {
                await action(element, index, "after")
            }
            index++
        }
    })
}
