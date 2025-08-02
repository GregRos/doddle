import { declare, type, type_of } from "declare-it"

import type { ASeq } from "@lib"
import { aseq } from "@lib"
const _seq = aseq
type _Seq<T> = ASeq<T>

declare.it("works for same input types", expect => {
    const s = _seq([1, 2, 3]).concatTo([4])
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("works for different input types", expect => {
    const s = _seq([1, 2, 3]).concatTo(["a"])
    expect(type_of(s)).to_equal(type<_Seq<number | string>>)
})

it("works for empty + empty", async () => {
    const s = _seq([]).concatTo([])
    await expect(s._qr).resolves.toEqual([])
})

it("works for 1 + 1 + 1", async () => {
    const s = _seq([3]).concatTo([1], [2])
    await expect(s._qr).resolves.toEqual([1, 2, 3])
})
