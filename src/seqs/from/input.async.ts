import { checkASeqInputValue } from "../../errors/messages.js"
import { isAsyncIterable, isIterable, isNextable } from "../../utils.js"
import { type ASeq, ASeqOperator } from "../seq/aseq.class.js"

export function async<T>(input: ASeq.Input<T>) {
    input = checkASeqInputValue(input)
    if (isAsyncIterable(input) || isIterable(input)) {
        return ASeqOperator(input, async function* aseq(input) {
            yield* input
        })
    }
    return ASeqOperator(input, async function* aseq(input) {
        const result = await input()
        if (isAsyncIterable(result) || isIterable(result)) {
            yield* result
            return
        }
        if (isNextable(result)) {
            for (let item = await result.next(); !item.done; item = await result.next()) {
                yield item.value
            }
        }
    })
}
