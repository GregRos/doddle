import { declare, type, type_of } from "declare-it"
import type { Lazy, LazyAsync } from "../../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

describe("sync", () => {
    const _seq = seq
    type SType<T> = Seq<T>
    declare.test("can be called with initial, type changes to match", expect => {
        const s = _seq([1, 2, 3]).reduce((acc, x) => `${acc}${x}`, "")
        expect(type_of(s)).to_equal(type<Lazy<string>>)
    })

    declare.test("can be called with no initial, type is T", expect => {
        const s = _seq([1, 2, 3])
        expect(type_of(s.reduce((acc, x) => acc + x))).to_equal(type<Lazy<number>>)
        // @ts-expect-error does not allow a different type
        s.reduce((acc, x) => `${acc}${x}`)
    })

    it("reduces with initial value on empty, giving initial", () => {
        const s = _seq([]).reduce((acc, x) => acc + x, 0)
        expect(s.pull()).toEqual(0)
    })

    it("with no initial value, reduce on empty throws, but only after pull", () => {
        const s = _seq<number>([])
        const result = s.reduce((acc, x) => acc + x)
        expect(() => result.pull()).toThrow()
    })

    it("reduces with initial value", () => {
        const s = _seq([1, 2, 3]).reduce((acc, x) => acc + x, 1)
        expect(s.pull()).toEqual(7)
    })

    it("reduce on singleton without initial value gives singleton", () => {
        const s = _seq([1]).reduce((acc, x) => acc + x)
        expect(s.pull()).toEqual(1)
    })

    it("reduce on singleton with initial value gives reduced", () => {
        const s = _seq([1]).reduce((acc, x) => acc + x, 1)
        expect(s.pull()).toEqual(2)
    })

    it("reduces without initial value", () => {
        const s = _seq([1, 2, 3]).reduce((acc, x) => acc + x)
        expect(s.pull()).toEqual(6)
    })

    it("calls reducer as many times as needed with no initial", () => {
        const fn = jest.fn((acc, x) => acc + x)
        const s = _seq([1, 2, 3]).reduce(fn)
        s.pull()
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("calls reducer as many times as needed with initial", () => {
        const fn = jest.fn((acc, x) => acc + x)
        const s = _seq([1, 2, 3]).reduce(fn, 1)
        s.pull()
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it("calls reducer as many times as needed on singleton", () => {
        const fn = jest.fn((acc, x) => acc + x)
        const s = _seq([1]).reduce(fn)
        s.pull()
        expect(fn).not.toHaveBeenCalled()
    })

    it("has no side-effects before pull", () => {
        const fn = jest.fn((acc, x) => acc + x)
        const s = _seq([1, 2, 3]).reduce(fn, 1)
        expect(fn).not.toHaveBeenCalled()
        s.pull()
        expect(fn).toHaveBeenCalledTimes(3)
    })
})

// test async `reduce` function
describe("async", () => {
    const _seq = aseq
    type _ASeq<T> = ASeq<T>

    declare.test("can be called with initial, type changes to match", expect => {
        const s = _seq([1, 2, 3]).reduce((acc, x) => `${acc}${x}`, "")
        expect(type_of(s)).to_equal(type<LazyAsync<string>>)
    })

    declare.test("can be called with no initial, type is T", expect => {
        const s = _seq([1, 2, 3])
        expect(type_of(s.reduce((acc, x) => acc + x))).to_equal(type<LazyAsync<number>>)
        // @ts-expect-error does not allow a different type
        s.reduce((acc, x) => `${acc}${x}`)
    })

    it("reduces with initial value on empty, giving initial", async () => {
        const s = _seq([]).reduce((acc, x) => acc + x, 0)
        expect(await s.pull()).toEqual(0)
    })

    it("with no initial value, reduce on empty throws, but only after pull", async () => {
        const s = _seq<number>([])
        const result = s.reduce((acc, x) => acc + x)
        await expect(() => result.pull()).rejects.toThrow()
    })

    it("reduces with initial value", async () => {
        const s = _seq([1, 2, 3]).reduce((acc, x) => acc + x, 1)
        expect(await s.pull()).toEqual(7)
    })

    it("reduce on singleton without initial value gives singleton", async () => {
        const s = _seq([1]).reduce((acc, x) => acc + x)
        expect(await s.pull()).toEqual(1)
    })

    it("reduce on singleton with initial value gives reduced", async () => {
        const s = _seq([1]).reduce((acc, x) => acc + x, 1)
        expect(await s.pull()).toEqual(2)
    })

    it("reduces without initial value", async () => {
        const s = _seq([1, 2, 3]).reduce((acc, x) => acc + x)
        expect(await s.pull()).toEqual(6)
    })

    it("calls reducer as many times as needed with no initial", async () => {
        const fn = jest.fn((acc, x) => acc + x)
        const s = _seq([1, 2, 3]).reduce(fn)
        await s.pull()
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("calls reducer as many times as needed with initial", async () => {
        const fn = jest.fn((acc, x) => acc + x)
        const s = _seq([1, 2, 3]).reduce(fn, 1)
        await s.pull()
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it("calls reducer as many times as needed on singleton", async () => {
        const fn = jest.fn((acc, x) => acc + x)
        const s = _seq([1]).reduce(fn)
        await s.pull()
        expect(fn).not.toHaveBeenCalled()
    })

    it("has no side-effects before pull", async () => {
        const fn = jest.fn((acc, x) => acc + x)
        const s = _seq([1, 2, 3]).reduce(fn, 1)
        expect(fn).not.toHaveBeenCalled()
        await s.pull()
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it("works for async reducers", async () => {
        const s = _seq([1, 2, 3]).reduce(async (acc, x) => acc + x, 1)
        expect(await s.pull()).toEqual(7)
    })
})
