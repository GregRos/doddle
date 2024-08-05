import { declare, type, type_of } from "declare-it"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
const _seq = seq
type _Seq<T> = Seq<T>

declare.it("element type stays the same", expect => {
    expect(type_of(_seq([1, 2, 3]).skip(1))).to_equal(type<_Seq<number>>)
})

it("skips no elements gives same array", () => {
    const s = _seq([1, 2, 3]).skip(0)
    expect(s._qr).toEqual([1, 2, 3])
})

it("skips some elements", () => {
    const s = _seq([1, 2, 3, 4]).skip(2)
    expect(s._qr).toEqual([3, 4])
})

it("skips more elements than available gives empty", () => {
    const s = _seq([1, 2, 3]).skip(5)
    expect(s._qr).toEqual([])
})

it("negative skips last elements", () => {
    const s = _seq([1, 2, 3, 4]).skip(-1)
    expect(s._qr).toEqual([1, 2, 3])
})

it("negative skips more last elements than available, giving empty", () => {
    const s = _seq([1, 2, 3]).skip(-5)
    expect(s._qr).toEqual([])
})

it("can iterate twice", () => {
    const s = _seq([1, 2, 3]).skip(1)
    expect(s._qr).toEqual([2, 3])
    expect(s._qr).toEqual([2, 3])
})

it("can iterate twice when skipping from the end", () => {
    const s = _seq([1, 2, 3]).skip(-1)
    expect(s._qr).toEqual([1, 2])
    expect(s._qr).toEqual([1, 2])
})
