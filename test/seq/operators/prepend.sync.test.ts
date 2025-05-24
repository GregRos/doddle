import { declare, type, type_of } from "declare-it"

import type { Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("returns seq of same time when input is empty", expect => {
    const s = _seq([1, 2, 3]).prepend()
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("unions type with input", expect => {
    const input = _seq([""])
    const after = input.prepend(4)
    expect(type_of(after)).to_equal(type<_Seq<string | number>>)
})

declare.it("unions type when inputs of disjoint types", expect => {
    const input = _seq([1, 2, 3])
    const after = input.prepend("4", true)
    expect(type_of(after)).to_equal(type<_Seq<string | number | boolean>>)
})

it("empty +> empty = empty", () => {
    const input = _seq([] as const)
    const after = input.prepend([])
    expect(after._qr).toEqual([])
})

it("empty +> x = x", () => {
    const input = _seq([1, 2] as const)
    const after = input.prepend()
    expect(after._qr).toEqual([1, 2])
})

it("x +> empty = x", () => {
    const input = _seq([] as const)
    const after = input.prepend(1, 2)
    expect(after._qr).toEqual([1, 2])
})

it("x +> y = x +> y", () => {
    const input = _seq([1, 2] as const)
    const after = input.prepend(3, 4)
    expect(after._qr).toEqual([3, 4, 1, 2])
})

it("pulls as many as needed", () => {
    const mock = jest.fn()
    const input = _seq([1, 2, 3]).each(mock)
    const after = input.prepend(4, 5)
    for (const x of after) {
        if (x === 5) {
            break
        }
    }
    expect(mock).toHaveBeenCalledTimes(0)
})
