import { isAsyncIterable, isIterable, isNextable } from "stdlazy/lib/utils"
import { ASeq } from "./wrapper.async"
import type { AnyPromisedSeqLike, AnySeqLike } from "../async/types"
import type { SeqLikeInput } from "../sync"
import { Seq } from "./wrapper.sync"

export class ASeqFrom<E> extends ASeq<E> {
    constructor(private readonly _internal: AnyPromisedSeqLike<E>) {
        super()
    }

    async *[Symbol.asyncIterator](): AsyncIterator<E, any, undefined> {}
}

export async function* asyncFrom<E>(items: AnyPromisedSeqLike<E>): AsyncIterable<E> {}

export class SeqFrom<E> extends Seq<E> {
    constructor(private readonly _internal: SeqLikeInput<E>) {
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
export function syncFrom<E>(items: SeqLikeInput<E>) {
    return new SeqFrom(items)
}
