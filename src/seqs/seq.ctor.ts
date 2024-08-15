import { checkSeqInputValue, gotAsyncIteratorInSyncContext } from "../errors/error.js"
import { pull, type Lazy } from "../lazy/index.js"
import { isIterable, isThenable } from "../utils.js"
import { SeqOperator, type Seq } from "./seq.class.js"

export function seq(input: readonly never[]): Seq<never>
export function seq<E>(input: Seq.ObjectIterable<Lazy<E>>): Seq<E>
export function seq<E>(input: readonly E[]): Seq<E>
export function seq<E>(input: Seq.Input<E>): Seq<E>
export function seq<E>(input: Seq.Input<E>): any {
    input = checkSeqInputValue(input)
    if (isIterable(input)) {
        return SeqOperator(input, function* seq(input) {
            yield* input
        })
    }
    return SeqOperator(input, function* seq(input) {
        const invoked = typeof input === "function" ? input() : input
        const pulled = pull(invoked)
        if (isIterable(pulled)) {
            yield* pulled
            return
        }
        for (let item = pulled.next(); !item.done; item = pulled.next()) {
            if (isThenable(item)) {
                gotAsyncIteratorInSyncContext()
            }
            yield item.value
        }
    })
}
