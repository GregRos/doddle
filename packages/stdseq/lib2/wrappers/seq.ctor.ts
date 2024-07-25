import type { Lazy } from "stdlazy/lib"
import type { SeqLikeInput } from "../f-types"
import { fromSyncInput } from "../from/input"
import { sync as syncOf } from "../from/of"
import { sync as syncRange } from "../from/range"
import { sync as syncRepeat } from "../from/repeat"
import { Seq } from "./seq.class"
export function _seq<E = never>(): Seq<E>
export function _seq<E>(input: Lazy<SeqLikeInput<E>>): Seq<E>
export function _seq<E>(input: E[]): Seq<E>
export function _seq<E>(input: SeqLikeInput<E>): Seq<E>
export function _seq<E>(input?: SeqLikeInput<E> | Lazy<SeqLikeInput<E>>) {
    if (!input) {
        return fromSyncInput([])
    }
    return fromSyncInput(input)
}
_seq.prototype = Seq.prototype

export const seq = Object.assign(_seq, {
    of: syncOf,
    repeat: syncRepeat,
    range: syncRange
})
export type seq<T> = Seq<T>
