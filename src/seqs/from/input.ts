import { gotNonIterable } from "../../errors/error"
import { isIterable, isAsyncIterable, isLazy, isNextable, isThenable } from "../../utils"
import type { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { ASeqOperator, type ASeq } from "../seq/aseq.class"
import { SeqOperator } from "../seq/seq.class"

export function async<T>(input: ASeq.Input<T>) {
    if (isIterable(input)) {
        return new ASeqOperator(input, async function* aseq(input) {
            yield* input
        })
    }
    if (isAsyncIterable(input)) {
        return new ASeqOperator(input, async function* aseq(input) {
            yield* input
        })
    }
    if (typeof input === "function") {
        return new ASeqOperator(input, async function* aseq(input) {
            const result = input()
            if (isLazy(result)) {
                yield result.pull()
            } else if (isAsyncIterable(result) || isIterable(result)) {
                yield* result
            } else if (isNextable(result)) {
                for (let item = await result.next(); !item.done; item = await result.next()) {
                    yield item.value
                }
            } else {
                throw gotNonIterable(
                    result,
                    "async",
                    "it was a function that did not return an iterable or iterator"
                )
            }
        })
    }
    throw gotNonIterable(input, "sync", "it was not an iterable, async iterable, or function")
}

export function sync<T>(input: Seq.Input<T>) {
    if (isIterable(input)) {
        return new SeqOperator(input, function* seq(input) {
            yield* input
        })
    }
    if (typeof input === "function") {
        return new SeqOperator(input, function* seq(input) {
            const result = input()
            if (isIterable(result)) {
                yield* result
            } else if (isNextable(result)) {
                for (let item = result.next(); !item.done; item = result.next()) {
                    if (isThenable(item)) {
                        throw Error("Cannot use sync fromFunction with a thenable")
                    }
                    yield item.value
                }
            } else if (isAsyncIterable(result)) {
                throw gotNonIterable(
                    result,
                    "sync",
                    "it was an async iterable, which is not allowed in a sync context"
                )
            } else {
                throw gotNonIterable(
                    result,
                    "sync",
                    "it was a function that did not return an iterable or iterator"
                )
            }
        })
    }
    if (isAsyncIterable(input)) {
        throw gotNonIterable(
            input,
            "sync",
            "it was an async iterable, which is not allowed in a sync context"
        )
    }
    throw gotNonIterable(input, "sync", "it was not an iterable or a function")
}
