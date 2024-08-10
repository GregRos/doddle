import {
    checkASeqInputValue,
    checkSeqInputValue,
    gotAsyncIteratorInSyncContext
} from "../../errors/messages.js"
import { isAsyncIterable, isIterable, isNextable, isThenable } from "../../utils.js"
import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

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
