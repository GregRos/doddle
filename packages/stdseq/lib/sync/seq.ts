import { Lazy, lazy } from "stdlazy"
import { isIterable } from "stdlazy/utils"
import { Seq } from "./sync-wrapper"
import { SeqLike } from "./types"

export function seq(): Seq<never>
export function seq<E>(input: Lazy<SeqLike<E>>): Seq<E>
export function seq<E>(input: E[]): Seq<E>
export function seq<E>(input: SeqLike<E>): Seq<E>
export function seq<E>(input?: SeqLike<E> | Lazy<SeqLike<E>>) {
    input = lazy(() => input).pull()
    if (!input) {
        return new Seq<never>([])
    } else if (typeof input === "function") {
        return new Seq<E>(input)
    } else if (input instanceof Seq) {
        return input
    } else if (isIterable(input)) {
        return new Seq<E>(input as any)
    }
    throw new TypeError(`Cannot create Seq from ${input}`)
}
