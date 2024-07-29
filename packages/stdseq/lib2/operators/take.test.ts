import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>

    declare.it("element type stays the same without ellipsis", expect => {
        expect(type_of(_seq([1, 2, 3]).take(1))).to_equal(type<_Seq<number>>)
    })

    declare.it("element type changes with ellipsis", expect => {
        expect(type_of(_seq([1, 2, 3]).take(1, "..." as string))).to_equal(
            type<_Seq<number | string>>
        )
    })

    declare.it("ellipsis is const", expect => {
        expect(type_of(_seq([1, 2, 3]).take(1, "..."))).to_equal(type<_Seq<number | "...">>)
    })

    declare.it("no disjunction if ellipsis is nullish", expect => {
        expect(type_of(_seq([1, 2, 3]).take(1, null as null | undefined))).to_equal(
            type<_Seq<number>>
        )
    })

    declare.it("excludes nullishness out of ellipsis if it's nullable", expect => {
        expect(type_of(_seq([1]).take(1, null as null | string))).to_equal(
            type<_Seq<number | string>>
        )
    })

    it("takes no elements gives empty", () => {
        const s = _seq([1, 2, 3]).take(0)
        expect(s._qr).toEqual([])
    })

    it("takes some elements", () => {
        const s = _seq([1, 2, 3]).take(2)
        expect(s._qr).toEqual([1, 2])
    })

    it("takes more elements than available", () => {
        const s = _seq([1, 2, 3]).take(5)
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("takes exact number of elements available", () => {
        const s = _seq([1, 2, 3]).take(3)
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("has no side-effects, pulls as many as needed", () => {
        const sq = jest.fn(function* () {
            yield 1
            yield 2
            yield 3
            expect(false).toBe(true) // This should not be reached
        })
        const tkw = _seq(sq).take(2)
        expect(sq).not.toHaveBeenCalled()
        expect(tkw._qr).toEqual([1, 2])
        expect(sq).toHaveBeenCalledTimes(1)
    })

    it("can iterate twice", () => {
        const s = _seq([1, 2, 3]).take(2)
        expect(s._qr).toEqual([1, 2])
        expect(s._qr).toEqual([1, 2])
    })

    it("-1 takes last element", () => {
        const s = _seq([1, 2, 3]).take(-1)
        expect(s._qr).toEqual([3])
    })

    it("-2 takes last two elements", () => {
        const s = _seq([1, 2, 3]).take(-2)
        expect(s._qr).toEqual([2, 3])
    })

    it("-3 takes last 3 elements", () => {
        const s = _seq([1, 2, 3]).take(-3)
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("taking more than available from the end gives all", () => {
        const s = _seq([1, 2, 3]).take(-5)
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("taking 0 from the end gives empty", () => {
        const s = _seq([1, 2, 3]).take(-0)
        expect(s._qr).toEqual([])
    })

    it("can iterate twice when taken from the end", () => {
        const s = _seq([1, 2, 3]).take(-2)
        expect(s._qr).toEqual([2, 3])
        expect(s._qr).toEqual([2, 3])
    })

    it("ellipsis is not inserted if all items are taken", () => {
        const s = _seq([1, 2, 3]).take(-3, "...")
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("ellipsis is not inserted if max+ items are taken from end", () => {
        const s = _seq([1, 2, 3]).take(-5, "...")
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("ellipsis is inserted if some items are taken", () => {
        const s = _seq([1, 2, 3]).take(-2, "...")
        expect(s._qr).toEqual(["...", 2, 3])
    })

    it("no ellipsis if it's nullish", () => {
        const s = _seq([1, 2, 3]).take(-5, null)
        expect(s._qr).toEqual([1, 2, 3])
    })
})

// test async `take` function
describe("async", () => {
    const _aseq = aseq
    type _ASeq<T> = ASeq<T>

    declare.it("element type stays the same without ellipsis", expect => {
        expect(type_of(_aseq([1, 2, 3]).take(1))).to_equal(type<_ASeq<number>>)
    })

    declare.it("element type changes with ellipsis", expect => {
        expect(type_of(_aseq([1, 2, 3]).take(1, "..." as string))).to_equal(
            type<_ASeq<number | string>>
        )
    })

    declare.it("ellipsis is const", expect => {
        expect(type_of(_aseq([1, 2, 3]).take(1, "..."))).to_equal(type<_ASeq<number | "...">>)
    })

    declare.it("no disjunction if ellipsis is nullish", expect => {
        expect(type_of(_aseq([1, 2, 3]).take(1, null as null | undefined))).to_equal(
            type<_ASeq<number>>
        )
    })

    declare.it("excludes nullishness out of ellipsis if it's nullable", expect => {
        expect(type_of(_aseq([1]).take(1, null as null | string))).to_equal(
            type<_ASeq<number | string>>
        )
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

    it("ellipsis is inserted if some items are taken", async () => {
        const s = _aseq([1, 2, 3]).take(-2, "...")
        expect(await s._qr).toEqual(["...", 2, 3])
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
