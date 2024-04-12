import { LazyAsync, LazyLike, Seq } from "../..";
import { ASeq } from "./wrapper";
export type MaybePromise<T> = T | Promise<T>;
export type AsyncIteratee<E, O> = (
    this: ASeq<E>,
    element: E,
    index: number
) => MaybePromise<O>;
export type AsyncPredicate<E> = AsyncIteratee<E, boolean>;
export type AsyncReducer<E, O> = (
    this: ASeq<E>,
    acc: O,
    element: E,
    index: number
) => MaybePromise<O>;
export type ASeqLike<E> =
    | ASeq<E>
    | Seq<E>
    | Iterable<E>
    | AsyncIterator<E>
    | (() =>
          | AsyncIterable<E>
          | AsyncIterator<E>
          | Iterable<E>
          | AsyncIterator<E>);
