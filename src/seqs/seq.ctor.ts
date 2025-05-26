import { pull, type Doddle } from "../doddle/index.js"
import { checkSeqInputValue, gotAsyncIteratorInSyncContext } from "../errors/error.js"
import { _iter, isArrayLike, isInt, isIterable, isNextable, isThenable } from "../utils.js"
import { SeqOperator, type Seq } from "./seq.class.js"

function seq(input: readonly never[]): Seq<never>
function seq<E>(input: Seq.ObjectIterable<Doddle<E>>): Seq<E>
function seq<E>(input: readonly E[]): Seq<E>
function seq<E>(input: Seq.Input<E>): Seq<E>
function seq<E>(input: Seq.Input<E>): any {
    input = checkSeqInputValue(input)
    if (isNextable(input)) {
        return seq(() => input).cache()
    }
    if (isIterable(input) || isArrayLike(input)) {
        return seq(() => input)
    }

    return SeqOperator(input, function* seq(input) {
        const invoked = typeof input === "function" ? input() : input
        let pulled = pull(invoked)
        if (isArrayLike(pulled)) {
            for (const key of Object.keys(pulled)) {
                if (isInt(+key)) {
                    yield pull(pulled[+key])
                }
            }
            return
        }
        if (isIterable(pulled)) {
            pulled = _iter(pulled)
        }
        for (let item = pulled.next(); !item.done; item = pulled.next()) {
            if (isThenable(item)) {
                gotAsyncIteratorInSyncContext()
            }
            yield pull(item.value)
        }
        pulled.return?.()
    })
}

export const ___seq = seq
