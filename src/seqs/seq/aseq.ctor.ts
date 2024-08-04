import { async as asyncOf } from "../from/of"
import { async as asyncRange } from "../from/range"
import { async as asyncRepeat } from "../from/repeat"
import { async as asyncFrom } from "../from/input"
import type { Lazy, LazyAsync } from "../../lazy"

import { type ASeq } from "./aseq.class"
function _aseq<E = never>(): ASeq<E>
function _aseq<E>(input: readonly E[]): ASeq<E>
function _aseq<E>(input: ASeq.SimpleInput<PromiseLike<LazyAsync<E>>>): ASeq<E>
function _aseq<E>(input: ASeq.SimpleInput<LazyAsync<E>>): ASeq<E>
function _aseq<E>(input: ASeq.SimpleInput<PromiseLike<E>>): ASeq<E>
function _aseq<E>(input: ASeq.SimpleInput<Lazy<E>>): ASeq<E>
function _aseq<E>(input: ASeq.SimpleInput<E>): ASeq<E>
function _aseq<E>(input: ASeq.Input<E>): ASeq<E>
function _aseq<E>(input?: ASeq.Input<E>): any {
    if (!input) {
        return asyncFrom([])
    }
    return asyncFrom(input)
}
export const aseq = Object.assign(_aseq, {
    of: asyncOf,
    repeat: asyncRepeat,
    range: asyncRange,
    is(input: any): input is ASeq<any> {
        return input instanceof aseq
    }
})
