import { Lazy, lazy } from "stdlazy"
import { Seq, SeqFrom } from "./sync-wrapper"
import { SeqLikeInput } from "./types"

export function seq(): Seq<never>
export function seq<E>(input: Lazy<SeqLikeInput<E>>): Seq<E>
export function seq<E>(input: E[]): Seq<E>
export function seq<E>(input: SeqLikeInput<E>): Seq<E>
export function seq<E>(input?: SeqLikeInput<E> | Lazy<SeqLikeInput<E>>) {
    input = lazy(() => input).pull()
    return new SeqFrom(input ?? []) as Seq<E>
}
