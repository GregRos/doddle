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

    it("pulls as many as needed", () => {
        const iter = jest.fn(function* () {
            yield 1
            yield 2
            expect(false).toBe(true) // This should not be reached
        })
        const s = _seq(iter)
        const tkw = s.take(2)
        expect(iter).not.toHaveBeenCalled()
        expect(tkw._qr).toEqual([1, 2])
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

    it("pulls as many as needed", async () => {
        const iter = jest.fn(function* () {
            yield 1
            yield 2
            expect(false).toBe(true) // This should not be reached
        })
        const s = _aseq(iter)
        const tkw = s.take(2)
        expect(iter).not.toHaveBeenCalled()
        await expect(tkw._qr).resolves.toEqual([1, 2])
    })
})
