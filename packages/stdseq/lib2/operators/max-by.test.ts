import { declare, type, type_of } from "declare-it"
import type { Lazy, LazyAsync } from "stdlazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

// test maxBy function
describe("sync", () => {
    const _seq = seq
    type SType<T> = Seq<T>
    declare.test("should type as Lazy<T | undefined>", expect => {
        expect(type_of(_seq([1, 2, 3]).maxBy(() => true))).to_equal(type<Lazy<number | undefined>>)
    })
    declare.test("should type as Lazy<T | string> with alt", expect => {
        expect(type_of(_seq([1, 2, 3]).maxBy(() => true, "alt" as string))).to_equal(
            type<Lazy<number | string>>
        )
    })
    declare.test("should type as Lazy<T | 'alt'> with alt", expect => {
        expect(type_of(_seq([1, 2, 3]).maxBy(() => true, "alt"))).to_equal(
            type<Lazy<number | "alt">>
        )
    })
    it("returns undefined for empty", () => {
        const s = _seq([]).maxBy(() => true)
        expect(s.pull()).toEqual(undefined)
    })

    it("sorted input", () => {
        const s = _seq([1, 2, 3]).maxBy(x => x)
        expect(s.pull()).toEqual(3)
    })

    it("unsorted input", () => {
        const s = _seq([3, 1, 2]).maxBy(x => x)
        expect(s.pull()).toEqual(3)
    })

    it("returns first value for same input", () => {
        const s = _seq([1, 2, 3]).maxBy(() => true)
        expect(s.pull()).toEqual(1)
    })

    it("returns alt for empty sequence", () => {
        const s = _seq([]).maxBy(() => false, "alt")
        expect(s.pull()).toEqual("alt")
    })

    it("returns undefined if no alt", () => {
        const s = _seq([]).maxBy(() => false)
        expect(s.pull()).toEqual(undefined)
    })

    it("no side-effects before pull", () => {
        const fn = jest.fn(function* () {
            yield 1
        })
        const s = _seq(fn)
        const lazy = s.maxBy(() => true)
        expect(fn).not.toHaveBeenCalled()
        lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("calls iteratee as many times as needed", () => {
        const fn = jest.fn(x => x)
        const s = _seq([1, 2, 3]).maxBy(fn)
        expect(fn).not.toHaveBeenCalled()
        s.pull()
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it("no calls for empty sequence", () => {
        const fn = jest.fn(x => x)
        const s = _seq([]).maxBy(fn)
        expect(fn).not.toHaveBeenCalled()
        s.pull()
        expect(fn).not.toHaveBeenCalled()
    })

    it("returns first max value", () => {
        const s = _seq([1, 2, 3, 2]).maxBy(x => x)
        expect(s.pull()).toEqual(3)
    })

    it("doesn't error for non-comparable keys", () => {
        const s = expect(() =>
            _seq([1, 2, 3])
                .maxBy(x => {})
                .pull()
        ).not.toThrow()
    })

    it("iteratee receives index", () => {
        const s = _seq([1, 2, 3]).maxBy((x, i) => {
            expect(i).toBe(x - 1)
            return x
        })
        expect(s.pull()).toEqual(3)
    })
})

// test async `maxBy` function
describe("async", () => {
    const _aseq = aseq
    type _ASeq<T> = ASeq<T>

    declare.test("should type as LazyAsync<T | undefined>", expect => {
        expect(type_of(_aseq([1, 2, 3]).maxBy(() => true))).to_equal(
            type<LazyAsync<number | undefined>>
        )
    })

    declare.test("should type as LazyAsync<T | string> with alt", expect => {
        expect(type_of(_aseq([1, 2, 3]).maxBy(() => true, "alt" as string))).to_equal(
            type<LazyAsync<number | string>>
        )
    })

    declare.test("should type as LazyAsync<T | 'alt'> with alt", expect => {
        expect(type_of(_aseq([1, 2, 3]).maxBy(() => true, "alt"))).to_equal(
            type<LazyAsync<number | "alt">>
        )
    })

    it("returns undefined for empty", async () => {
        const s = _aseq([]).maxBy(() => true)
        expect(await s.pull()).toEqual(undefined)
    })

    it("sorted input", async () => {
        const s = _aseq([1, 2, 3]).maxBy(x => x)
        expect(await s.pull()).toEqual(3)
    })

    it("unsorted input", async () => {
        const s = _aseq([3, 1, 2]).maxBy(x => x)
        expect(await s.pull()).toEqual(3)
    })

    it("returns first value for same input", async () => {
        const s = _aseq([1, 2, 3]).maxBy(() => true)
        expect(await s.pull()).toEqual(1)
    })

    it("returns alt for empty sequence", async () => {
        const s = _aseq([]).maxBy(() => false, "alt")
        expect(await s.pull()).toEqual("alt")
    })

    it("returns undefined if no alt", async () => {
        const s = _aseq([]).maxBy(() => false)
        expect(await s.pull()).toEqual(undefined)
    })

    it("no side-effects before pull", async () => {
        const fn = jest.fn(async function* () {
            yield 1
        })
        const s = _aseq(fn)
        const lazy = s.maxBy(() => true)
        expect(fn).not.toHaveBeenCalled()
        await lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("calls iteratee as many times as needed", async () => {
        const fn = jest.fn(x => x)
        const s = _aseq([1, 2, 3]).maxBy(fn)
        expect(fn).not.toHaveBeenCalled()
        await s.pull()
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it("no calls for empty sequence", async () => {
        const fn = jest.fn(x => x)
        const s = _aseq([]).maxBy(fn)
        expect(fn).not.toHaveBeenCalled()
        await s.pull()
        expect(fn).not.toHaveBeenCalled()
    })

    it("returns first max value", async () => {
        const s = _aseq([1, 2, 3, 2]).maxBy(x => x)
        expect(await s.pull()).toEqual(3)
    })

    it("doesn't error for non-comparable keys", async () => {
        const s = _aseq([1, 2, 3]).maxBy(x => ({}))
        await expect(s.pull()).resolves.not.toThrow()
    })

    it("iteratee receives index", async () => {
        const fn = jest.fn((x, i) => {
            expect(i).toBe(x - 1)
            return x
        })
        const s = _aseq([1, 2, 3]).maxBy(fn)
        expect(await s.pull()).toEqual(3)
    })

    it("works with async iteratee", async () => {
        const s = _aseq([1, 3, 2]).maxBy(async x => x)
        expect(await s.pull()).toEqual(3)
    })
})
