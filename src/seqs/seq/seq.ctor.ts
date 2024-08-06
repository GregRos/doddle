import type { Lazy } from "../../lazy/index.js"
import { sync as syncFrom } from "../from/input.js"
import { type Seq } from "./seq.class.js"
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
