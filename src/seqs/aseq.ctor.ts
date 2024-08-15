import { checkASeqInputValue } from "../errors/error.js"
import { pull, type Lazy, type LazyAsync } from "../lazy/index.js"
import { isAsyncIterable, isIterable, isNextable } from "../utils.js"
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
        const result = typeof input === "function" ? input() : input
        const pulled = await pull(result)
        if (isAsyncIterable(pulled) || isIterable(pulled)) {
            yield* pulled
            return
        }
        if (isNextable(pulled)) {
            for (let item = await pulled.next(); !item.done; item = await pulled.next()) {
                yield item.value
            }
        }
    })
}
