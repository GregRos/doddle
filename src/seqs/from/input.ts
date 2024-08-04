import { gotNonIterable } from "../../errors/error"
import { isIterable, isAsyncIterable, isLazy, isNextable, isThenable } from "../../lazy"
import type { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { asyncOperator, type ASeq } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"

export function async<T>(input: ASeq.Input<T>) {
    if (isIterable(input) || isAsyncIterable(input)) {
        return new asyncOperator("fromIterable", input, async function* (input) {
            yield* input
        })
    }
    if (typeof input === "function") {
        return new asyncOperator("fromFunction", input, async function* (input) {
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
}

export function sync<T>(input: Seq.Input<T>) {
    if (isIterable(input)) {
        return new syncOperator("fromIterable", input, function* (input) {
            yield* input
        })
    }
    if (typeof input === "function") {
        return new syncOperator("fromFunction", input, function* (input) {
            const result = input()
            if (isLazy(result)) {
                yield result.pull()
            } else if (isIterable(result)) {
                yield* result
            } else if (isNextable(result)) {
                for (let item = result.next(); !item.done; item = result.next()) {
                    if (isThenable(item)) {
                        throw Error("Cannot use sync fromFunction with a thenable")
                    }
                    yield item.value
                }
            } else if (isAsyncIterable(result)) {
                throw Error("Cannot use sync fromFunction with an async iterable")
            } else {
                throw gotNonIterable(
                    result,
                    "sync",
                    "it was a function that did not return an iterable or iterator"
                )
            }
        })
    }
}
