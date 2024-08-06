import { declare, type, type_of } from "declare-it"

import type { Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("returns Seq of same type", expect => {
    const s = _seq([1, 2, 3]).reverse()
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

it("returns empty on empty", () => {
    const s = _seq([]).reverse()
    expect(s._qr).toEqual([])
})

it("returns singleton on singleton", () => {
    const s = _seq([1]).reverse()
    expect(s._qr).toEqual([1])
})

it("reverses input", () => {
    const s = _seq([1, 2, 3]).reverse()
    expect(s._qr).toEqual([3, 2, 1])
})
