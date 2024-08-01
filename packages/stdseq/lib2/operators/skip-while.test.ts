import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

// tests skipWhile
describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    describe("type tests", () => {
        declare.it("keeps same type as input when no ellipsis is given", expect => {
            expect(type_of(_seq([1]).skipWhile(() => true))).to_equal(type<_Seq<number>>)
        })
    })

    it("immediate false gives same", () => {
        const s = _seq([1, 2, 3]).skipWhile(() => false)
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("constant true gives empty", () => {
        const s = _seq([1, 2, 3]).skipWhile(() => true)
        expect(s._qr).toEqual([])
    })

    it("discards while true", () => {
        const s = _seq([1, 2, 3, 4, 5]).skipWhile(x => x < 3)
        expect(s._qr).toEqual([3, 4, 5])
    })

    it("discards while true with index", () => {
        const s = _seq([1, 2, 3, 4, 5]).skipWhile((x, i) => i < 3)
        expect(s._qr).toEqual([4, 5])
    })

    it("has no side-effects, pulls as many as needed", () => {
        const sq = jest.fn(function* () {
            yield 1
            yield 2
            yield 3
            expect(false).toBe(true)
        })
        const tkw = _seq(sq).skipWhile(x => x < 2)
        expect(sq).not.toHaveBeenCalled()
        for (const x of tkw) {
            expect(x).toBe(2)
            break
        }
        expect(sq).toHaveBeenCalledTimes(1)
    })

    it("calls predicate as many times as needed", () => {
        const f = jest.fn(x => x < 2)
        const s = _seq([1, 2, 3, 4, 5]).skipWhile(f)
        expect(f).not.toHaveBeenCalled()
        for (const x of s) {
            expect(x).toBe(2)
            break
        }
        expect(f).toHaveBeenCalledTimes(2)
    })
})

// tests async skipWhile
describe("async", () => {
    const _seq = aseq
    type _Seq<T> = ASeq<T>
    declare.test("should type as Lazy<number>", expect => {
        expect(type_of(_seq([1, 2, 3]).skipWhile(() => true))).to_equal(type<_Seq<number>>)
        expect(type_of(_seq([1, 2, 3]).skipWhile(() => true))).to_equal(type<_Seq<number>>)
    })
    it("returns empty for constant true", async () => {
        const s = _seq([1, 2, 3]).skipWhile(() => true)
        expect(s._qr).resolves.toEqual([])
    })

    it("returns all for constant false", async () => {
        const s = _seq([1, 2, 3]).skipWhile(() => false)
        expect(await s._qr).toEqual([1, 2, 3])
    })

    it("returns all for no matches", async () => {
        const s = _seq([1, 2, 3]).skipWhile(() => false)
        expect(await s._qr).toEqual([1, 2, 3])
    })

    it("returns 2 for first false", async () => {
        const s = _seq([1, 2, 3, 4, 5]).skipWhile(x => x < 3)
        expect(await s._qr).toEqual([3, 4, 5])
    })

    it("returns 3 for first false with index", async () => {
        const s = _seq([1, 2, 3, 4, 5]).skipWhile((x, i) => i < 3)
        expect(await s._qr).toEqual([4, 5])
    })

    it("has no side-effects, pulls as many as needed", async () => {
        const sq = jest.fn(async function* () {
            yield 1
            yield 2
            yield 3
            expect(false).toBe(true)
        })
        const tkw = _seq(sq).skipWhile(x => x < 2)
        expect(sq).not.toHaveBeenCalled()
        for await (const x of tkw) {
            expect(x).toBe(2)
            break
        }
        expect(sq).toHaveBeenCalledTimes(1)
    })

    it("calls predicate as many times as needed", async () => {
        const f = jest.fn(x => x < 2)
        const s = _seq([1, 2, 3, 4, 5]).skipWhile(f)
        expect(f).not.toHaveBeenCalled()
        for await (const x of s) {
            expect(x).toBe(2)
            break
        }
        expect(f).toHaveBeenCalledTimes(2)
    })

    it("works with async predicate", async () => {
        const s = _seq([1, 2, 3]).skipWhile(async x => x < 2)
        expect(await s._qr).toEqual([2, 3])
    })
})