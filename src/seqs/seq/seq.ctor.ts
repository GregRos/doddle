import { checkSeqInputValue, gotAsyncIteratorInSyncContext } from "../../errors/error.js"
import type { Lazy } from "../../lazy/index.js"
import { isIterable, isThenable } from "../../utils.js"
import { SeqOperator, type Seq } from "./seq.class.js"
export function seq<E = never>(): Seq<E>
export function seq(input: never[]): Seq<never>
export function seq<E>(input: Seq.IterableInput<Lazy<E>>): Seq<E>
export function seq<E>(input: E[]): Seq<E>
export function seq<E>(input: Seq.Input<E>): Seq<E>
export function seq<E>(input?: Seq.Input<E>) {
    input ??= []
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
