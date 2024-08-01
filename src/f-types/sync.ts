export type Iteratee<E, O> = (element: E, index: number) => O
export type NoIndexIteratee<E, O> = (element: E) => O
export type StageIteratee<E, O> = (element: E, index: number, stage: "before" | "after") => O
export type Predicate<E> = Iteratee<E, boolean>
export type OrdProjection<E, O extends string | number | bigint> = Iteratee<E, O>
export type TypePredicate<E, T extends E> = (element: E, index: number) => element is T

export type Reducer<E, O> = (acc: O, element: E, index: number) => O

export type DelayedSeqLikeInput<E> = Iterable<E> | Iterator<E>
export type SeqLikeInput<E> = Iterable<E> | (() => DelayedSeqLikeInput<E>)
export type getSeqLikeElementType<T> = T extends SeqLikeInput<infer E> ? E : never
export type Eq<E> = (a: E, b: E) => boolean
