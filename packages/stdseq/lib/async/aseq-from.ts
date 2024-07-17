import { isAsyncIterable, isIterable, isNextable } from "stdlazy/lib/utils"
import { ASeq } from "./async-wrapper"
import type { AnyPromisedSeqLike } from "./types"

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
