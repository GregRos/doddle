import { Lazy, LazyAsync, isPullable, isThenable } from "stdlazy"
import { LaziesError } from "../error"
import { SeqLike } from "../sync/types"
import { isAsyncIterable, isIterable, isNextable } from "../util"
import { ASeq } from "./async-wrapper"
import { ASeqLike, AnySeqLike } from "./types"
function normalizeItem(item: any): any {
    if (isThenable(item)) {
        return item.then(normalizeItem)
    } else if (isPullable(item)) {
        return normalizeItem(item.pull())
    }
    return item
}

export function aseq<E = never>(): ASeq<E>
export function aseq<E>(input: readonly E[]): ASeq<E>

export function aseq<E>(input: AnySeqLike<PromiseLike<LazyAsync<E>>>): ASeq<E>
export function aseq<E>(input: AnySeqLike<LazyAsync<E>>): ASeq<E>
export function aseq<E>(input: AnySeqLike<PromiseLike<E>>): ASeq<E>
export function aseq<E>(input: AnySeqLike<Lazy<E>>): ASeq<E>
export function aseq<E>(input: PromiseLike<AnySeqLike<E>>): ASeq<E>
export function aseq<E>(input: AnySeqLike<E>): ASeq<E>
export function aseq<E>(input?: ASeqLike<E> | SeqLike<E> | PromiseLike<AnySeqLike<E>>): any {
    if (!input) {
        return new ASeq<E>((async function* () {})())
    }
    if (isThenable<AnySeqLike<E>>(input)) {
        return new ASeq(
            (async function* () {
                const result = await input
                yield* aseq(result)
            })()
        )
    }
    if (input instanceof ASeq) {
        return input
    } else if (isAsyncIterable<E>(input)) {
        return new ASeq<E>(input)
    } else if (isIterable<E>(input)) {
        return new ASeq<Awaited<E>>({
            async *[Symbol.asyncIterator]() {
                for (const x of input) {
                    yield normalizeItem(x)
                }
            }
        })
    } else if (typeof input === "function") {
        return new ASeq<E>({
            async *[Symbol.asyncIterator]() {
                const result = input()
                if (isAsyncIterable<E>(result)) {
                    yield* aseq(result)
                } else if (isIterable<E>(result)) {
                    yield* aseq(result)
                } else if (isNextable<E>(result)) {
                    for (let item = await result.next(); !item.done; item = await result.next()) {
                        yield normalizeItem(item.value)
                    }
                } else {
                    throw new LaziesError(
                        `Got unexpected result from iterator constructor: ${result}`
                    )
                }
            }
        })
    }
    throw new LaziesError(`Cannot create Seq from ${input}`)
}
