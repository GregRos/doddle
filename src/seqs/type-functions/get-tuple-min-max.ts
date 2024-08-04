import type { CreateTuple, GreaterThan, Increment } from "type-plus"

export type getRangeDisjunction<Start extends number, End extends number> = Start extends End
    ? Start
    : GreaterThan<End, Start> extends true
      ? Start | getRangeDisjunction<Increment<Start>, End>
      : never

export type getTupleMinMax<T, Start extends number, End extends number> = CreateTuple<
    getRangeDisjunction<Start, End>,
    T
>

export type getTupleUpTo<T, End extends number> = number extends End
    ? [T, ...T[]]
    : getTupleMinMax<T, 1, End>
