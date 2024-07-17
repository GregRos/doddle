import { SeqLike } from "../sync/types"
import { ASeq } from "./async-wrapper"
export type MaybePromise<T> = T | Promise<T>
export type AsyncIteratee<E, O, I = ASeq<E>> = (
    this: I,
    element: E,
    index: number
) => MaybePromise<O>
export type AsyncIteratee2<E, O, I = AsyncIterable<E>> = (
    this: I,
    element: E,
    index: number
) => MaybePromise<O>
export type AsyncPredicate<E> = AsyncIteratee<E, boolean>
export type AsyncReducer<E, O> = (
    this: ASeq<E>,
    acc: O,
    element: E,
    index: number
) => MaybePromise<O>
export type ASeqLike<E> = ASeq<E> | AsyncIterable<E> | (() => AsyncIterable<E> | AsyncIterator<E>)
export type AnySeqLike<E> = ASeqLike<E> | SeqLike<E>
export type AnyPromisedSeqLike<E> =
    | AnySeqLike<E>
    | AnySeqLike<PromiseLike<E>>
    | PromiseLike<AnySeqLike<E>>
export type AnySeq<E> = Iterable<E> | AsyncIterable<E>

export type getIteratedType<T extends AnySeq<any>> =
    T extends Iterable<infer E> ? E : T extends AsyncIterable<infer E> ? E : never
export type replaceIteratedElement<Type extends AnySeq<any>, AltElementType> =
    Type extends Iterable<any>
        ? Iterable<AltElementType>
        : Type extends AsyncIterable<any>
          ? AsyncIterable<AltElementType>
          : never
