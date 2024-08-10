import { parseStage, Stage } from "../../utils.js"
import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"
export type EachCallStage = "before" | "after" | "both" | undefined
function each<T>(
    this: Iterable<T>,
    action: Seq.StageIteratee<T, void>,
    stage: EachCallStage | undefined = "before"
) {
    chk(each).action(action)
    chk(each).stage(stage)
    const myStage = parseStage(stage)
    return SeqOperator(this, function* each(input) {
        let index = 0
        for (const element of input) {
            if (myStage & Stage.Before) {
                action(element, index, "before")
            }
            yield element
            if (myStage & Stage.After) {
                action(element, index, "after")
            }
            index++
        }
    })
}
export default each
