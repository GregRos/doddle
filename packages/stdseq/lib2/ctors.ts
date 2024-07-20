import { Lazy, LazyAsync, isPullable, isThenable } from "stdlazy"
import { ASeq, Seq } from "./wrappers"
import type { AnyPromisedSeqLike, AnySeqLike, SeqLikeInput } from "./f-types"
import { fromAsyncInput, fromSyncInput } from "./from/input"

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
        return fromAsyncInput([])
    }
    return fromAsyncInput(input)
}

export function seq(): Seq<never>
export function seq<E>(input: Lazy<SeqLikeInput<E>>): Seq<E>
export function seq<E>(input: E[]): Seq<E>
export function seq<E>(input: SeqLikeInput<E>): Seq<E>
export function seq<E>(input?: SeqLikeInput<E> | Lazy<SeqLikeInput<E>>) {
    if (!input) {
        return fromSyncInput([])
    }
    return fromSyncInput(input)
}
