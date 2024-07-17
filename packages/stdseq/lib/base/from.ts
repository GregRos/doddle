import { isAsyncIterable, isIterable, isNextable } from "stdlazy/lib/utils"
import { ASeq } from "./wrapper.async"
import type { AnyPromisedSeqLike, AnySeqLike } from "../async/types"
import type { SeqLike } from "../sync"
import { Seq } from "./wrapper.sync"

export class ASeqFrom<E> extends ASeq<E> {
    constructor(private readonly _internal: AnyPromisedSeqLike<E>) {
        super()
    }

    async *[Symbol.asyncIterator](): AsyncIterator<E, any, undefined> {
        const items = await this._internal
        if (isAsyncIterable(items)) {
            yield* items
        } else if (isIterable(items)) {
            yield* items
        } else if (typeof items === "function") {
            const result = items()
            if (isAsyncIterable(result)) {
                yield* result
            } else if (isIterable(result)) {
                yield* result
            } else if (isNextable(result)) {
                for (let item = await result.next(); !item.done; item = await result.next()) {
                    yield item.value
                }
            } else {
                throw new Error(`Got unexpected result from iterator constructor: ${result}`)
            }
        }
    }
}

export async function* asyncFrom<E>(items: AnyPromisedSeqLike<E>): AsyncIterable<E> {
    if (isAsyncIterable(items)) {
        yield* items
    } else if (isIterable(items)) {
        yield* items
    } else if (typeof items === "function") {
        const result = items()
        if (isAsyncIterable(result)) {
            yield* result
        } else if (isIterable(result)) {
            yield* result
        } else if (isNextable(result)) {
            for (let item = await result.next(); !item.done; item = await result.next()) {
                yield item.value
            }
        } else {
            throw new Error(`Got unexpected result from iterator constructor: ${result}`)
        }
    }
}

export class SeqFrom<E> extends Seq<E> {
    constructor(private readonly _internal: SeqLike<E>) {
        super()
    }

    *[Symbol.iterator](): Iterator<E, any, undefined> {
        const items = this._internal
        if (typeof items === "function") {
            const result = items()
            if (isIterable(result)) {
                yield* result
            } else {
                for (;;) {
                    const { done, value } = result.next()
                    if (done) {
                        return
                    }
                    yield value
                }
            }
        } else {
            yield* items
        }
    }
}
export function syncFrom<E>(items: SeqLike<E>) {
    return new SeqFrom(items)
}
