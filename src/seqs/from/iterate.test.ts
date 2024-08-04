import { declare, type, type_of } from "declare-it"
import { seq } from "../seq/seq.ctor"
import type { Seq } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

// tests seq(...) and aseq(...) constructors
describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    declare.it("can't be called with less than two arguments", () => {
        // @ts-expect-error
        _seq.iterate(1)
        // @ts-expect-error
        _seq.iterate()
    })

    declare.it("can't be called with a non-function argument", () => {
        // @ts-expect-error
        _seq.iterate(2, 1)
    })

    declare.it("element type same as function return type", expect => {
        expect(type_of(_seq.iterate(3, () => 1))).to_equal(type<_Seq<number>>)
        expect(type_of(_seq.iterate(3, () => "a"))).to_equal(type<_Seq<string>>)
    })

    declare.it("function receives index", () => {
        _seq.iterate(3, (x: number) => x)
    })

    it("gives empty on count of 0", () => {
        expect(_seq.iterate(0, () => 1)._qr).toEqual([])
    })

    it("gives singleton on count of 1", () => {
        expect(_seq.iterate(1, () => 1)._qr).toEqual([1])
    })

    it("calls function repeatedly", () => {
        const fn = jest.fn(() => 1)
        expect(_seq.iterate(3, fn)._qr).toEqual([1, 1, 1])
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it("calls function repeatedly with index", () => {
        const fn = jest.fn((x: number) => x)
        expect(_seq.iterate(3, fn)._qr).toEqual([0, 1, 2])
        expect(fn).toHaveBeenCalledTimes(3)
        expect(fn).toHaveBeenNthCalledWith(1, 0)
        expect(fn).toHaveBeenNthCalledWith(2, 1)
        expect(fn).toHaveBeenNthCalledWith(3, 2)
    })

    it("can iterate twice, calling function repeatedly", () => {
        const fn = jest.fn(i => i)
        const s = _seq.iterate(3, fn)
        expect(s._qr).toEqual([0, 1, 2])
        expect(s._qr).toEqual([0, 1, 2])
        expect(fn).toHaveBeenCalledTimes(6)
    })

    it("pulls only as needed", () => {
        const fn = jest.fn(i => i)
        const s = _seq.iterate(3, fn)
        for (const x of s) {
            if (x === 1) break
        }
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("accepts Infinite count", () => {
        const fn = jest.fn(i => i)
        const s = _seq.iterate(Infinity, fn)
        expect(s.take(1000)._qr).toHaveLength(1000)
        expect(fn).toHaveBeenCalledTimes(1000)
    })
})

describe("async", () => {
    const _seq = aseq
    type _Seq<T> = ASeq<T>

    declare.it("can't be called with less than two arguments", () => {
        // @ts-expect-error
        _seq.iterate(1)
        // @ts-expect-error
        _seq.iterate()
    })

    declare.it("can't be called with a non-function argument", () => {
        // @ts-expect-error
        _seq.iterate(2, 1)
    })

    declare.it("element type same as function return type", expect => {
        expect(type_of(_seq.iterate(3, () => 1))).to_equal(type<_Seq<number>>)
        expect(type_of(_seq.iterate(3, () => "a"))).to_equal(type<_Seq<string>>)
    })

    declare.it("function receives index", () => {
        _seq.iterate(3, (x: number) => x)
    })

    it("gives empty on count of 0", async () => {
        expect(await _seq.iterate(0, () => 1)._qr).toEqual([])
    })

    it("gives singleton on count of 1", async () => {
        expect(await _seq.iterate(1, () => 1)._qr).toEqual([1])
    })

    it("calls function repeatedly", async () => {
        const fn = jest.fn(() => 1)
        const s = _seq.iterate(3, fn)
        expect(await s._qr).toEqual([1, 1, 1])
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it("calls function repeatedly with index", async () => {
        const fn = jest.fn((x: number) => x)
        const s = _seq.iterate(3, fn)
        expect(await s._qr).toEqual([0, 1, 2])
        expect(fn).toHaveBeenCalledTimes(3)
        expect(fn).toHaveBeenNthCalledWith(1, 0)
        expect(fn).toHaveBeenNthCalledWith(2, 1)
        expect(fn).toHaveBeenNthCalledWith(3, 2)
    })

    it("can iterate twice, calling function repeatedly", async () => {
        const fn = jest.fn(i => i)
        const s = _seq.iterate(3, fn)
        expect(await s._qr).toEqual([0, 1, 2])
        expect(await s._qr).toEqual([0, 1, 2])
        expect(fn).toHaveBeenCalledTimes(6)
    })

    it("pulls only as needed", async () => {
        const fn = jest.fn(i => i)
        const s = _seq.iterate(3, fn)
        for await (const x of s) {
            if (x === 1) break
        }
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("accepts Infinite count", async () => {
        const fn = jest.fn(i => i)
        const s = _seq.iterate(Infinity, fn)
        expect((await s.take(1000)._qr).length).toBe(1000)
        expect(fn).toHaveBeenCalledTimes(1000)
    })

    it("works with async function", async () => {
        const fn = jest.fn(async i => i)
        const s = _seq.iterate(3, fn)
        expect(await s._qr).toEqual([0, 1, 2])
        expect(fn).toHaveBeenCalledTimes(3)
    })
})
