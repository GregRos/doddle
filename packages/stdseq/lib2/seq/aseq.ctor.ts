import type { Lazy, LazyAsync } from "stdlazy"
import type { AnySeqLike, ASeqLikeInput } from "../f-types"
import { fromAsyncInput } from "../from/input"
import { async as asyncOf } from "../from/of"
import { async as asyncRange } from "../from/range"
import { async as asyncRepeat } from "../from/repeat"

import type { ASeq } from "./aseq.class"
function _aseq<E = never>(): ASeq<E>
function _aseq<E>(input: readonly E[]): ASeq<E>
function _aseq<E>(input: AnySeqLike<PromiseLike<LazyAsync<E>>>): ASeq<E>
function _aseq<E>(input: AnySeqLike<LazyAsync<E>>): ASeq<E>
function _aseq<E>(input: AnySeqLike<PromiseLike<E>>): ASeq<E>
function _aseq<E>(input: AnySeqLike<Lazy<E>>): ASeq<E>
function _aseq<E>(input: PromiseLike<AnySeqLike<E>>): ASeq<E>
function _aseq<E>(input: AnySeqLike<E>): ASeq<E>
function _aseq<E>(input?: ASeqLikeInput<E>): any {
    if (!input) {
        return fromAsyncInput([])
    }
    return fromAsyncInput(input)
}
export type aseq<T> = ASeq<T>
export const aseq = Object.assign(_aseq, {
    of: asyncOf,
    repeat: asyncRepeat,
    range: asyncRange,
    is(input: any): input is ASeq<any> {
        return input instanceof aseq
    }
})
