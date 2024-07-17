import { Seq } from "./sync-wrapper"

export type Iteratee<E, O, I = Seq<E>> = (this: I, element: E, index: number) => O
export type Iteratee2<E, O, I = Iterable<E>> = (this: I, element: E, index: number) => O

export type Predicate<E> = Iteratee<E, boolean>
export type TypePredicate<E, T extends E, I = Seq<E>> = (
    this: I,
    element: E,
    index: number
) => element is T
export type Reducer<E, O> = (this: Seq<E>, acc: O, element: E, index: number) => O
export type SeqLike<E> = Seq<E> | Iterable<E> | (() => Iterable<E> | Iterator<E>)
