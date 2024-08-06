import type { Lazy } from "../../lazy"
import { sync as syncFrom } from "../from/input"
import { type Seq } from "./seq.class"
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
