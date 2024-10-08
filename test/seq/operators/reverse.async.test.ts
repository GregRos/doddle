import type { ASeq } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _aseq = aseq
type _ASeq<T> = ASeq<T>
declare.it("should type as Doddle<T>", expect => {
    expect(type_of(_aseq([1, 2, 3]).reverse())).to_equal(type<_ASeq<number>>)
})

it("returns empty on empty", async () => {
    const s = _aseq([]).reverse()
    expect(await s._qr).toEqual([])
})

it("returns singleton on singleton", async () => {
    const s = _aseq([1]).reverse()
    expect(await s._qr).toEqual([1])
})

it("reverses input", async () => {
    const s = _aseq([1, 2, 3]).reverse()
    expect(await s._qr).toEqual([3, 2, 1])
})
