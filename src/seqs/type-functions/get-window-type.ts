import type { CreateTuple, Decrement, GreaterThan, Increment } from "type-plus";
import type { CreateOptionalTuple } from "./get-optional-tuple";

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
export type getReturnedWindowType<T, L extends number> = getTupleUpTo<T, L>

export type getWindowProjectionArgsType<T, L extends number> = number extends L
    ? [T, ...T[]]
    : [T, ...CreateOptionalTuple<Decrement<L>, T>]
export type isNullish<T> = T extends null | undefined ? true : false
export type maybeDisjunction<T, Ellipsis> =
    isNullish<Ellipsis> extends true ? T : T | NonNullable<Ellipsis>
