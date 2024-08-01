import type { Decrement } from "type-plus"
import type { CreateOptionalTuple } from "./get-optional-tuple"
import type { getTupleUpTo } from "./get-tuple-min-max"

export type getReturnedWindowType<T, L extends number> = getTupleUpTo<T, L>

export type getWindowProjectionArgsType<T, L extends number> = number extends L
    ? [T, ...T[]]
    : [T, ...CreateOptionalTuple<Decrement<L>, T>]
