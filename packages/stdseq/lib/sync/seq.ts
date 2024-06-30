import { Lazy, lazy } from "stdlazy"
import { Seq, SeqFrom } from "./sync-wrapper"
import { SeqLike } from "./types"

export function seq(): Seq<never>
export function seq<E>(input: Lazy<SeqLike<E>>): Seq<E>
export function seq<E>(input: E[]): Seq<E>
export function seq<E>(input: SeqLike<E>): Seq<E>
export function seq<E>(input?: SeqLike<E> | Lazy<SeqLike<E>>) {
    input = lazy(() => input).pull()
    return new SeqFrom(input ?? []) as Seq<E>
}
