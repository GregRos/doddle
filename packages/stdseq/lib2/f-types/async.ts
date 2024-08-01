import type { SeqLikeInput } from "./sync"

export type AsyncIteratee<E, O> = (element: E, index: number) => O | Promise<O>
export type StageAsyncIteratee<E, O> = (
    element: E,
    index: number,
    stage: "before" | "after"
) => O | Promise<O>
export type AsyncNoIndexIteratee<E, O> = (element: E) => O | Promise<O>

export type AsyncPredicate<E> = AsyncIteratee<E, boolean>
export type AsyncReducer<E, O> = (acc: O, element: E, index: number) => O | Promise<O>
export type getASeqLikeElementType<T> = T extends ASeqLikeInput<infer E> ? E : never

export type ASeqLike<E> = AsyncIterable<E> | (() => AsyncIterable<E> | AsyncIterator<E>)

export type AnySeqLike<E> = ASeqLike<E> | SeqLikeInput<E>

export type ASeqLikeInput<E> =
    | AnySeqLike<E>
    | AnySeqLike<PromiseLike<E>>
    | PromiseLike<AnySeqLike<E>>
