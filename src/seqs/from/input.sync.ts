import { checkSeqInputValue, gotAsyncIteratorInSyncContext } from "../../errors/messages.js"
import { isIterable, isThenable } from "../../utils.js"
import { type Seq, SeqOperator } from "../seq/seq.class.js"

export function sync<T>(input: Seq.Input<T>) {
    input = checkSeqInputValue(input)
    if (isIterable(input)) {
        return SeqOperator(input, function* seq(input) {
            yield* input
        })
    }
    return SeqOperator(input, function* seq(input) {
        const result = input()
        if (isIterable(result)) {
            yield* result
            return
        }
        for (let item = result.next(); !item.done; item = result.next()) {
            if (isThenable(item)) {
                gotAsyncIteratorInSyncContext()
            }
            yield item.value
        }
    })
}
