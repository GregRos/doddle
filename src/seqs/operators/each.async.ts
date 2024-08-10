import { parseStage, Stage } from "../../utils.js"
import { chk } from "../seq/_seq.js"
import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
export type EachCallStage = "before" | "after" | "both" | undefined
function each<T>(
    this: AsyncIterable<T>,
    action: ASeq.StageIteratee<T, void>,
    stage: EachCallStage = "before"
) {
    chk(each).action(action)
    chk(each).stage(stage)
    const myStage = parseStage(stage)
    return ASeqOperator(this, async function* each(input) {
        let index = 0
        for await (const element of input) {
            if (myStage & Stage.Before) {
                await action(element, index, "before")
            }
            yield element
            if (myStage & Stage.After) {
                await action(element, index, "after")
            }
            index++
        }
    })
}
export default each
