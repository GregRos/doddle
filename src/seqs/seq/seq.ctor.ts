import { sync as syncOf } from "../from/of"
import { sync as syncRange } from "../from/range"
import { sync as syncRepeat } from "../from/repeat"
import { sync as syncFrom } from "../from/input"
import { sync as syncIterate } from "../from/iterate"
import type { Lazy } from "../../lazy"
import { type Seq } from "./seq.class"
export function _seq<E = never>(): Seq<E>
export function _seq(input: never[]): Seq<never>
export function _seq<E>(input: Seq.IterableInput<Lazy<E>>): Seq<E>
export function _seq<E>(input: E[]): Seq<E>
export function _seq<E>(input: Seq.Input<E>): Seq<E>
export function _seq<E>(input?: Seq.Input<E>) {
    if (!input) {
        return syncFrom([])
    }
    return syncFrom(input)
}

export const seq = Object.assign(_seq, {
    of: syncOf,
    repeat: syncRepeat,
    range: syncRange,
    is(input: any): input is Seq<any> {
        return input instanceof seq
    },
    iterate: syncIterate
})
