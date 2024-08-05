import type { LazyAsync, Lazy } from "../../lazy"
import type { ASeq } from "./aseq.class"
import { async as asyncFrom } from "../from/input"

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
