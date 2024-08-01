import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

import { seq } from "../seq/seq.ctor"
import type { Seq } from "../seq/seq.class"

// tests reverse
describe("sync", () => {
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
})

// test async `reverse` function
describe("async", () => {
    const _aseq = aseq
    type _ASeq<T> = ASeq<T>
    declare.it("should type as Lazy<T>", expect => {
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
})
