import { declare, type, type_of } from "declare-it"

import type { Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>

declare.it("works for same input types", expect => {
    const s = _seq([1, 2, 3]).concatTo([4])
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("works for different input types", expect => {
    const s = _seq([1, 2, 3]).concatTo(["a"])
    expect(type_of(s)).to_equal(type<_Seq<number | string>>)
})

it("works for empty + empty", () => {
    const s = _seq([]).concatTo([])
    expect(s._qr).toEqual([])
})

it("works for 1 + 1 + 1", () => {
    const s = _seq([3]).concatTo([1], [2])
    expect(s._qr).toEqual([1, 2, 3])
})
