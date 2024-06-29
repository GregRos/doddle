import { Lazy, LazyAsync, isPullable, isThenable } from "stdlazy"
import { ASeq, ASeqFrom } from "./async-wrapper"
import { AnySeqLike, type AnyPromisedSeqLike } from "./types"
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
export function aseq<E>(input?: AnyPromisedSeqLike<E>): any {
    if (!input) {
        return new ASeqFrom<E>([])
    }
    return new ASeqFrom(input) as ASeq<E>
}
