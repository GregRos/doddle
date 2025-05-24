import { declare, type, type_of } from "declare-it"

import type { Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>

declare.it("same type as input", expect => {
    const input = _seq([1, 2, 3])
    const after = input.exclude([1, 2, 3])
    expect(type_of(after)).to_subtype(type<_Seq<number>>)
})

it("excludes nothing from empty", () => {
    const input = _seq([] as const)
    const after = input.exclude([])
    expect(after._qr).toEqual([])
})

it("excludes something from empty", () => {
    const input = _seq([] as number[])
    const after = input.exclude([1])
    expect(after._qr).toEqual([])
})

it("excludes something from non-empty", () => {
    const input = _seq([1, 2, 3] as const)
    const after = input.exclude([1])
    expect(after._qr).toEqual([2, 3])
})

it("excludes multiple from non-empty", () => {
    const input = _seq([1, 2, 3] as const)
    const after = input.exclude([1, 2])
    expect(after._qr).toEqual([3])
})

it("excludes self from self", () => {
    const input = _seq([1, 2, 3] as const)
    const after = input.exclude(input)
    expect(after._qr).toEqual([])
})

it("no side-effects before pull", () => {
    const mock = jest.fn()
    const input = _seq([1, 2, 3]).each(mock)
    const after = input.exclude([1])
    expect(mock).not.toHaveBeenCalled()
    for (const _ of after) {
    }
    expect(mock).toHaveBeenCalledTimes(3)
})
