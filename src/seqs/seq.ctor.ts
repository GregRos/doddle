import { pull, type Doddle } from "../doddle/index.js"
import { checkSeqInputValue, gotAsyncIteratorInSyncContext } from "../errors/error.js"
import {
    _iter,
    isArrayLike,
    isFunction,
    isInt,
    isIterable,
    isNextable,
    isThenable,
    keys
} from "../utils.js"
import { SeqOperator, type Seq } from "./seq.class.js"

/**
 * Creates a {@link Seq} from the provided input. See examples for usage.
 *
 * @example
 *     // Array
 *     seq([1, 2, 3]) // {1, 2, 3}
 *
 *     // Generator function
 *     seq(function* () {
 *         yield 1
 *         yield 2
 *     })
 *
 *     // Doddle yielding a sequence
 *     seq(doddle(() => [1, 2, 3]))
 *
 *     // Function returning a sequence
 *     seq(() => [1, 2, 3])
 *
 *     // An iterable
 *     seq(seq([1, 2, 3]))
 *
 *     // An array-like object, such as a NodeList:
 *     seq(document.getElementsByTagName("div"))
 *
 *     // An ITERATOR, which is a special case that will be cached.
 *     seq(seq([1, 2, 3])[Symbol.iterator]())
 *
 *     // ⛔ Strings are not allowed here
 *     seq("hello")
 *
 * @param input The input to create the {@link Seq} from.
 */
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
        const invoked = isFunction(input) ? input() : input
        let pulled = pull(invoked)
        if (isArrayLike(pulled)) {
            for (const key of keys(pulled)) {
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
