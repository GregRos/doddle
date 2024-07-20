export type Iteratee<E, O> = (element: E, index: number) => O

export type Predicate<E> = Iteratee<E, boolean>

export type TypePredicate<E, T extends E> = (element: E, index: number) => element is T

export type Reducer<E, O> = (acc: O, element: E, index: number) => O

export type SeqLikeInput<E> = Iterable<E> | (() => Iterable<E> | Iterator<E>)
