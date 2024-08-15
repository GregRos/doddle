import type { ASeq } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _aseq = aseq
type _ASeq<T> = ASeq<T>

declare.it("element type stays the same", expect => {
    expect(type_of(_aseq([1, 2, 3]).skip(1))).to_equal(type<_ASeq<number>>)
})

it("skips no elements gives same array", async () => {
    const s = _aseq([1, 2, 3]).skip(0)
    expect(await s._qr).toEqual([1, 2, 3])
})

it("skips some elements", async () => {
    const s = _aseq([1, 2, 3, 4]).skip(2)
    expect(await s._qr).toEqual([3, 4])
})

it("skips more elements than available gives empty", async () => {
    const s = _aseq([1, 2, 3]).skip(5)
    expect(await s._qr).toEqual([])
})

it("negative skips last elements", async () => {
    const s = _aseq([1, 2, 3, 4]).skip(-1)
    expect(await s._qr).toEqual([1, 2, 3])
})

it("negative skips more last elements than available, giving empty", async () => {
    const s = _aseq([1, 2, 3]).skip(-5)
    expect(await s._qr).toEqual([])
})

it("can iterate twice", async () => {
    const s = _aseq([1, 2, 3]).skip(1)
    expect(await s._qr).toEqual([2, 3])
    expect(await s._qr).toEqual([2, 3])
})

it("can iterate twice when skipping from the end", async () => {
    const s = _aseq([1, 2, 3]).skip(-1)
    expect(await s._qr).toEqual([1, 2])
    expect(await s._qr).toEqual([1, 2])
})
