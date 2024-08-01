import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    declare.it("returns seq of same type", expect => {
        const s = _seq([1, 2, 3]).orderBy(() => 1)
        expect(type_of(s)).to_equal(type<_Seq<number>>)
    })

    it("returns empty on empty", () => {
        const s = _seq([]).orderBy(() => 1)
        expect(s._qr).toEqual([])
    })

    it("returns singleton on singleton", () => {
        const s = _seq([1]).orderBy(() => 1)
        expect(s._qr).toEqual([1])
    })

    it("doesn't change order for same key", () => {
        const s = _seq([1, 2, 1, 2]).orderBy(() => 1)
        expect(s._qr).toEqual([1, 2, 1, 2])
    })

    it("sorted input", () => {
        const s = _seq([1, 2, 3]).orderBy(x => x)
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("unsorted input", () => {
        const s = _seq([3, 1, 2]).orderBy(x => x)
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("input with duplicates", () => {
        const s = _seq([1, 2, 1, 2]).orderBy(x => x)
        expect(s._qr).toEqual([1, 1, 2, 2])
    })

    it("no side-effects before pull", () => {
        const fn = jest.fn(function* () {
            yield 1
            yield 2
            yield 3
        })
        const input = _seq(fn)
        const result = input.orderBy(x => x)
        expect(fn).not.toHaveBeenCalled()
        for (const _ of result) {
        }
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("pulls, calls iteratee as many as needed", () => {
        const sq = jest.fn(function* () {
            yield 1
            yield 2
            yield 3
        })
        const map = jest.fn(x => x)
        const tkw = _seq(sq).orderBy(map)
        expect(sq).not.toHaveBeenCalled()
        expect(map).not.toHaveBeenCalled()
        for (const _ of tkw) {
        }
        expect(map).toHaveBeenCalledTimes(3)
        expect(sq).toHaveBeenCalledTimes(1)
    })

    it("doesn't throw for incomparable key", () => {
        expect(() =>
            _seq([null, undefined, NaN, {}, []])
                .orderBy(x => x)
                .toArray()
                .pull()
        ).not.toThrow()
    })
})

// test async `orderBy` function
describe("async", () => {
    const _aseq = aseq
    type _ASeq<T> = ASeq<T>

    declare.it("returns aseq of same type", expect => {
        const s = _aseq([1, 2, 3]).orderBy(() => 1)
        expect(type_of(s)).to_equal(type<_ASeq<number>>)
    })

    it("returns empty on empty", async () => {
        const s = _aseq([]).orderBy(() => 1)
        expect(await s._qr).toEqual([])
    })

    it("returns singleton on singleton", async () => {
        const s = _aseq([1]).orderBy(() => 1)
        expect(await s._qr).toEqual([1])
    })

    it("doesn't change order for same key", async () => {
        const s = _aseq([1, 2, 1, 2]).orderBy(() => 1)
        expect(await s._qr).toEqual([1, 2, 1, 2])
    })

    it("sorted input", async () => {
        const s = _aseq([1, 2, 3]).orderBy(x => x)
        expect(await s._qr).toEqual([1, 2, 3])
    })

    it("unsorted input", async () => {
        const s = _aseq([3, 1, 2]).orderBy(x => x)
        expect(await s._qr).toEqual([1, 2, 3])
    })

    it("input with duplicates", async () => {
        const s = _aseq([1, 2, 1, 2]).orderBy(x => x)
        expect(await s._qr).toEqual([1, 1, 2, 2])
    })

    it("no side-effects before pull", async () => {
        const fn = jest.fn(async function* () {
            yield 1
            yield 2
            yield 3
        })
        const input = _aseq(fn)
        const result = input.orderBy(x => x)
        expect(fn).not.toHaveBeenCalled()
        for await (const _ of result) {
        }
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("pulls, calls iteratee as many as needed", async () => {
        const sq = jest.fn(async function* () {
            yield 1
            yield 2
            yield 3
        })
        const map = jest.fn(x => x)
        const tkw = _aseq(sq).orderBy(map)
        expect(sq).not.toHaveBeenCalled()
        expect(map).not.toHaveBeenCalled()
        for await (const _ of tkw) {
        }
        expect(map).toHaveBeenCalledTimes(3)
        expect(sq).toHaveBeenCalledTimes(1)
    })

    it("doesn't throw for incomparable key", async () => {
        await expect(
            _aseq([null, undefined, NaN, {}, []])
                .orderBy(x => x)
                .toArray()
                .pull()
        ).resolves.not.toThrow()
    })
})