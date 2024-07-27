import { mustBeFunction, mustBeOneOf } from "../errors/error"
import { type StageAsyncIteratee, type StageIteratee } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
export type EachCallStage = "before" | "after" | "both" | undefined
const mustBeStage = mustBeOneOf("before", "after", "both", undefined)
export function sync<T>(
    this: Iterable<T>,
    action: StageIteratee<T, void>,
    stage: EachCallStage = "before"
) {
    mustBeFunction("action", action)
    mustBeStage("stage", stage)
    stage ??= "before"
    return syncFromOperator("each", this, function* (input) {
        let index = 0
        for (const element of input) {
            if (stage === "before" || stage === "both") {
                action(element, index++, "before")
            }
            yield element
            if (stage === "after" || stage === "both") {
                action(element, index++, "after")
            }
        }
    })
}
export function async<T>(
    this: AsyncIterable<T>,
    action: StageAsyncIteratee<T, void>,
    stage: EachCallStage = "before"
) {
    mustBeFunction("action", action)
    mustBeStage("stage", stage)
    stage ??= "before"
    return asyncFromOperator("each", this, async function* (input) {
        let index = 0
        for await (const element of input) {
            if (stage === "before" || stage === "both") {
                await action(element, index++, "before")
            }
            yield element
            if (stage === "after" || stage === "both") {
                await action(element, index++, "after")
            }
        }
    })
}
