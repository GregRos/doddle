import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
// tests map

describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    declare.it("element type the same with id proejction", expect => {
        const s = _seq([1, 2, 3]).map(x => x)
        expect(type_of(s)).to_equal(type<_Seq<number>>)
    })

    declare.it("element type changes", expect => {
        const s = _seq([1, 2, 3]).map(x => x + "")
        expect(type_of(s)).to_equal(type<_Seq<string>>)
    })

    it("maps elements", () => {
        const s = _seq([1, 2, 3]).map(x => x + 1)
        expect(s._qr).toEqual([2, 3, 4])
    })

    it("maps elements with index", () => {
        const s = _seq([1, 2, 3]).map((x, i) => x + i)
        expect(s._qr).toEqual([1, 3, 5])
    })

    it("maps all elements to the same value", () => {
        const s = _seq([1, 2, 3]).map(() => 1)
        expect(s._qr).toEqual([1, 1, 1])
    })

    it("has no side-effects, pulls as many as needed", () => {
        const fn = jest.fn(x => x + 1)
        const s = _seq(function* () {
            yield 1
            yield 2
            expect(true).toBe(false)
        }).map(fn)
        expect(fn).not.toHaveBeenCalled()
        for (const x of s) {
            if (x === 3) {
                break
            }
        }
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("calls projection as many times as needed", () => {
        const fn = jest.fn(x => x + 1)
        const s = _seq([1, 2, 3]).map(fn)
        expect(fn).not.toHaveBeenCalled()
        for (const x of s) {
            if (x === 3) {
                break
            }
        }
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("can iterate twice", () => {
        const s = _seq([1, 2, 3]).map(x => x + 1)
        expect(s._qr).toEqual([2, 3, 4])
        expect(s._qr).toEqual([2, 3, 4])
    })
})
// test async `map` function
describe("async", () => {
    const _aseq = aseq
    type _ASeq<T> = ASeq<T>
    declare.it("element type the same with id projection", expect => {
        const s = _aseq([1, 2, 3]).map(x => x)
        expect(type_of(s)).to_equal(type<_ASeq<number>>)
    })

    declare.it("element type changes", expect => {
        const s = _aseq([1, 2, 3]).map(x => x + "")
        expect(type_of(s)).to_equal(type<_ASeq<string>>)
    })

    it("maps elements", async () => {
        const s = _aseq([1, 2, 3]).map(x => x + 1)
        expect(await s._qr).toEqual([2, 3, 4])
    })

    it("maps elements with index", async () => {
        const s = _aseq([1, 2, 3]).map((x, i) => x + i)
        expect(await s._qr).toEqual([1, 3, 5])
    })

    it("maps all elements to the same value", async () => {
        const s = _aseq([1, 2, 3]).map(() => 1)
        expect(await s._qr).toEqual([1, 1, 1])
    })

    it("has no side-effects, pulls as many as needed", async () => {
        const fn = jest.fn(x => x + 1)
        const s = _aseq(async function* () {
            yield 1
            yield 2
            expect(true).toBe(false) // This will not be reached unless all elements are processed
        }).map(fn)
        expect(fn).not.toHaveBeenCalled()
        for await (const x of s) {
            if (x === 3) {
                break
            }
        }
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("calls predicate as many times as needed", async () => {
        const fn = jest.fn(x => x + 1)
        const s = _aseq([1, 2, 3]).map(fn)
        let count = 0
        for await (const x of s) {
            if (x === 2) {
                break
            }
            count++
        }
        expect(fn).toHaveBeenCalledTimes(count + 1) // Checks the calls up to the break point
    })

    it("can iterate twice", async () => {
        const s = _aseq([1, 2, 3]).map(x => x + 1)
        expect(await s._qr).toEqual([2, 3, 4])
        expect(await s._qr).toEqual([2, 3, 4])
    })

    it("works for async projections", async () => {
        const s = _aseq([1, 2, 3]).map(async x => x + 1)
        expect(await s._qr).toEqual([2, 3, 4])
    })
})
