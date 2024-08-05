import { sync as syncOf } from "../from/of"
import { sync as syncRange } from "../from/range"
import { sync as syncRepeat } from "../from/repeat"
import { sync as syncFrom } from "../from/input"
import { sync as syncIterate } from "../from/iterate"
import { sync as syncThrows } from "../from/throws"
import type { Lazy } from "../../lazy"
import { type Seq } from "./seq.class"
import { seqSymbol } from "./symbol"
import { throws } from "assert"
export function seq<E = never>(): Seq<E>
export function seq(input: never[]): Seq<never>
export function seq<E>(input: Seq.IterableInput<Lazy<E>>): Seq<E>
export function seq<E>(input: E[]): Seq<E>
export function seq<E>(input: Seq.Input<E>): Seq<E>
export function seq<E>(input?: Seq.Input<E>) {
    if (!input) {
        return syncFrom([])
    }
    return syncFrom(input)
}
