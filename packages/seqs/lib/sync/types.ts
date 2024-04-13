import { Seq } from "./wrapper"

export type Iteratee<E, O> = (this: Seq<E>, element: E, index: number) => O
export type Predicate<E> = Iteratee<E, boolean>
export type Reducer<E, O> = (this: Seq<E>, acc: O, element: E, index: number) => O
export type SeqLike<E> = Seq<E> | Iterable<E> | (() => Iterable<E> | Iterator<E>)
