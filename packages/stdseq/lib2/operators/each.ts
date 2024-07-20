import { asyncFromOperator, lazyFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
export type EachCallStage = "before" | "after"
const _each = {
    name: "each",
    sync<T>(this: Iterable<T>, action: Iteratee<T, void>, stage: EachCallStage = "before") {
        return syncFromOperator(_each, this, function* (input) {
            let index = 0
            for (const element of input) {
                if (stage === "before") {
                    action(element, index++)
                }
                yield element
                if (stage === "after") {
                    action(element, index++)
                }
            }
        })
    },
    async<T>(this: AsyncIterable<T>, action: AsyncIteratee<T, void>, stage: EachCallStage) {
        return asyncFromOperator(_each, this, async function* (input) {
            let index = 0
            for await (const element of input) {
                if (stage === "before") {
                    await action(element, index++)
                }
                yield element
                if (stage === "after") {
                    await action(element, index++)
                }
            }
        })
    }
}

export default _each
