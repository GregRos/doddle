import type { Lazy, LazyAsync } from "../../lazy"
import { async as asyncFrom } from "../from/input"
import type { ASeq } from "./aseq.class"

export function aseq<E = never>(): ASeq<E>
export function aseq<E>(input: readonly E[]): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<PromiseLike<LazyAsync<E>>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<LazyAsync<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<PromiseLike<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<Lazy<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<E>): ASeq<E>
export function aseq<E>(input: ASeq.Input<E>): ASeq<E>
export function aseq<E>(input?: ASeq.Input<E>): any {
    if (!input) {
        return asyncFrom([])
    }
    return asyncFrom(input)
}
