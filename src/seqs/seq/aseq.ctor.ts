import { checkASeqInputValue } from "../../errors/error.js"
import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { isAsyncIterable, isIterable, isNextable } from "../../utils.js"
import { ASeqOperator, type ASeq } from "./aseq.class.js"

export function aseq<E>(input: readonly E[]): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<PromiseLike<LazyAsync<E>>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<LazyAsync<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<PromiseLike<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<Lazy<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<E>): ASeq<E>
export function aseq<E>(input: ASeq.Input<E>): ASeq<E>
export function aseq<E>(input: ASeq.Input<E>): any {
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
