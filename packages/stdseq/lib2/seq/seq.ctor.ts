import type { Lazy } from "stdlazy"
import type { SeqLikeInput } from "../f-types"
import { sync as syncOf } from "../from/of"
import { sync as syncRange } from "../from/range"
import { sync as syncRepeat } from "../from/repeat"
import { FromSyncInput, type Seq } from "./seq.class"
export function _seq<E = never>(): Seq<E>
export function _seq<E>(input: Lazy<SeqLikeInput<E>>): Seq<E>
export function _seq<E>(input: E[]): Seq<E>
export function _seq<E>(input: SeqLikeInput<E>): Seq<E>
export function _seq<E>(input?: SeqLikeInput<E> | Lazy<SeqLikeInput<E>>) {
    if (!input) {
        return new FromSyncInput([])
    }
    return new FromSyncInput(input)
}

export const seq = Object.assign(_seq, {
    of: syncOf,
    repeat: syncRepeat,
    range: syncRange,
    is(input: any): input is Seq<any> {
        return input instanceof seq
    }
})
export type seq<T> = Seq<T>
