import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
// test sync `skip` function
describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>

    declare.it("element type stays the same without ellipsis", expect => {
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
})
// test async `take` function
describe("async", () => {
    const _aseq = aseq
    type _ASeq<T> = ASeq<T>

    declare.it("element type stays the same without ellipsis", expect => {
        expect(type_of(_aseq([1, 2, 3]).take(1))).to_equal(type<_ASeq<number>>)
    })

    it("takes no elements gives empty", async () => {
        const s = _aseq([1, 2, 3]).take(0)
        expect(await s._qr).toEqual([])
    })

    it("takes some elements", async () => {
        const s = _aseq([1, 2, 3]).take(2)
        expect(await s._qr).toEqual([1, 2])
    })

    it("takes more elements than available", async () => {
        const s = _aseq([1, 2, 3]).take(5)
        expect(await s._qr).toEqual([1, 2, 3])
    })

    it("takes exact number of elements available", async () => {
        const s = _aseq([1, 2, 3]).take(3)
        expect(await s._qr).toEqual([1, 2, 3])
    })

    it("-1 takes last element", async () => {
        const s = _aseq([1, 2, 3]).take(-1)
        expect(await s._qr).toEqual([3])
    })

    it("-2 takes last two elements", async () => {
        const s = _aseq([1, 2, 3]).take(-2)
        expect(await s._qr).toEqual([2, 3])
    })

    it("can iterate twice", async () => {
        const s = _aseq([1, 2, 3]).take(2)
        expect(await s._qr).toEqual([1, 2])
        expect(await s._qr).toEqual([1, 2])
    })

    it("can iterate twice when taken from the end", async () => {
        const s = _aseq([1, 2, 3]).take(-2)
        expect(await s._qr).toEqual([2, 3])
        expect(await s._qr).toEqual([2, 3])
    })
})
