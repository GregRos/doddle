import { declare, type, type_of } from "declare-it"
import { Lazy, type LazyAsync } from "../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

import { seq } from "../seq/seq.ctor"
import type { Seq } from "../seq/seq.class"
// tests scan

describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    declare.it("accepts an input sequence, returns Lazy<boolean>", expect => {
        const s = null! as Seq<number>
        expect(type_of(s.setEquals(s))).to_equal(type<Lazy<boolean>>)
    })
    declare.it("accepts input sequence of subtype, returns Lazy<boolean>", expect => {
        const s1 = null! as Seq<number>
        const s2 = null! as Seq<1 | 2 | 3>
        expect(type_of(s1.setEquals(s2))).to_equal(type<Lazy<boolean>>)
    })
    declare.it("accepts input sequence of supertype, returns Lazy<boolean>", expect => {
        const s1 = null! as Seq<1 | 2 | 3>
        const s2 = null! as Seq<number>
        expect(type_of(s1.setEquals(s2))).to_equal(type<Lazy<boolean>>)
    })
    declare.it("doesn't accept non-subtype, non-supertype inputs", expect => {
        const s1 = null! as Seq<1 | 2>
        const s2 = null! as Seq<2 | 3>
        // @ts-expect-error
        s1.setEquals(s2)
    })
    it("returns true for empty sequences", () => {
        const s = _seq([]).setEquals(_seq([]))
        expect(s.pull()).toEqual(true)
    })
    it("returns false for empty vs singleton", () => {
        const s = _seq([]).setEquals(_seq([1]))
        expect(s.pull()).toEqual(false)
    })

    it("returns true for same sequence", () => {
        const s = _seq([1, 2, 3]).setEquals(_seq([1, 2, 3]))
        expect(s.pull()).toEqual(true)
    })

    it("returns true for same sequence in different order", () => {
        const s = _seq([1, 2, 3]).setEquals(_seq([3, 2, 1]))
        expect(s.pull()).toEqual(true)
    })

    it("returns false for different sequences", () => {
        const s = _seq([1, 2, 3]).setEquals(_seq([1, 2, 4]))
        expect(s.pull()).toEqual(false)
    })

    it("returns false for subsets", () => {
        const s = _seq([1, 2, 3]).setEquals(_seq([1, 2]))
        expect(s.pull()).toEqual(false)
    })

    it("returns false for different elements", () => {
        const s = _seq([1, 2, 3]).setEquals(_seq([1, 2, "3"]))
        expect(s.pull()).toEqual(false)
    })

    it("has no side-effects before pull", () => {
        const fn = jest.fn(function* () {
            yield 1
        })
        const s = _seq(fn)
        const lazy = s.setEquals(s)
        expect(fn).not.toHaveBeenCalled()
        lazy.pull()
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("accepts different seq input types", () => {
        const s1 = _seq([1, 2])
        expect(
            s1
                .setEquals(function* () {
                    yield 1
                    yield 2
                })
                .pull()
        ).toEqual(true)
        expect(s1.setEquals([1, 2]).pull()).toEqual(true)
        expect(s1.setEquals(() => s1[Symbol.iterator]()).pull()).toEqual(true)
    })
})

// test async `seqEquals` function
describe("async", () => {
    const _aseq = aseq
    type _ASeq<T> = ASeq<T>

    declare.it("accepts an input sequence, returns LazyAsync<boolean>", expect => {
        const s = null! as ASeq<number>
        expect(type_of(s.seqEquals(s))).to_equal(type<LazyAsync<boolean>>)
    })

    declare.it("accepts input sequence of subtype, returns LazyAsync<boolean>", expect => {
        const s1 = null! as ASeq<number>
        const s2 = null! as ASeq<1 | 2 | 3>
        expect(type_of(s1.seqEquals(s2))).to_equal(type<LazyAsync<boolean>>)
    })

    declare.it("accepts input sequence of supertype, returns LazyAsync<boolean>", expect => {
        const s1 = null! as ASeq<1 | 2 | 3>
        const s2 = null! as ASeq<number>
        expect(type_of(s1.seqEquals(s2))).to_equal(type<LazyAsync<boolean>>)
    })

    it("returns true for empty sequences", async () => {
        const s = _aseq([]).seqEquals(_aseq([]))
        expect(await s.pull()).toEqual(true)
    })

    it("returns false for empty vs singleton", async () => {
        const s = _aseq([]).seqEquals(_aseq([1]))
        expect(await s.pull()).toEqual(false)
    })

    it("returns true for same sequence", async () => {
        const s = _aseq([1, 2, 3]).seqEquals(_aseq([1, 2, 3]))
        expect(await s.pull()).toEqual(true)
    })

    it("returns false for different sequences", async () => {
        const s = _aseq([1, 2, 3]).seqEquals(_aseq([1, 2, 4]))
        expect(await s.pull()).toEqual(false)
    })

    it("returns false for different lengths", async () => {
        const s = _aseq([1, 2, 3]).seqEquals(_aseq([1, 2]))
        expect(await s.pull()).toEqual(false)
    })

    it("returns false for different elements", async () => {
        const s = _aseq([1, 2, 3]).seqEquals(_aseq([1, 2, "3"]))
        expect(await s.pull()).toEqual(false)
    })

    it("has no side-effects before pull", async () => {
        const fn = jest.fn(async function* () {
            yield 1
        })
        const s = _aseq(fn)
        const lazy = s.seqEquals(s)
        expect(fn).not.toHaveBeenCalled()
        await lazy.pull()
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("accepts different seq input types", async () => {
        const s1 = _aseq([1, 2])
        expect(
            await s1
                .seqEquals(async function* () {
                    yield 1
                    yield 2
                })
                .pull()
        ).toEqual(true)
        expect(
            await s1
                .seqEquals(function* () {
                    yield 1
                    yield 2
                })
                .pull()
        ).toEqual(true)
        expect(await s1.seqEquals([1, 2]).pull()).toEqual(true)
        expect(await s1.seqEquals(() => s1[Symbol.asyncIterator]()).pull()).toEqual(true)
    })
})
