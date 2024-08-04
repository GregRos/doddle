import { declare, type, type_of } from "declare-it"
import type { Lazy, LazyAsync } from "../../lazy"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
import type { ASeq } from "../seq/aseq.class"

describe("sync", () => {
    const f = seq
    type SType<T> = Seq<T>
    declare.test("should type as Lazy<number>", expect => {
        expect(type_of(f([1, 2, 3]).count(() => true))).to_equal(type<Lazy<number>>)
        expect(type_of(f([1, 2, 3]).count())).to_equal(type<Lazy<number>>)
    })
    it("returns 0 for empty", () => {
        const s = f([]).count(() => true)
        expect(s.pull()).toEqual(0)
    })

    it("returns 0 for no matches", () => {
        const s = f([1, 2, 3]).count(() => false)
        expect(s.pull()).toEqual(0)
    })

    it("returns 3 for all matches", () => {
        const s = f([1, 2, 3]).count(() => true)
        expect(s.pull()).toEqual(3)
    })

    it("returns count with no predicate", () => {
        const s = f([1, 2, 3]).count()
        expect(s.pull()).toEqual(3)
    })
    it("has no side-effects before pull", () => {
        const fn = jest.fn(function* () {})
        const s = f(fn)
        const lazy = s.count()
        expect(fn).not.toHaveBeenCalled()
        lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("calls predicate as many times as needed", () => {
        const fn = jest.fn(() => true)
        const s = f([1, 2, 3]).count(fn)
        s.pull()
        expect(fn).toHaveBeenCalledTimes(3)
    })
})
describe("async", () => {
    const f = aseq
    type SType<T> = ASeq<T>
    declare.test("should type as Lazy<number>", expect => {
        expect(type_of(f([1, 2, 3]).count(() => true))).to_equal(type<LazyAsync<number>>)
        expect(type_of(f([1, 2, 3]).count())).to_equal(type<LazyAsync<number>>)
    })
    it("returns 0 for empty", async () => {
        const s = f([]).count(() => true)
        await expect(s.pull()).resolves.toEqual(0)
    })

    it("returns 0 for no matches", async () => {
        const s = f([1, 2, 3]).count(() => false)
        await expect(s.pull()).resolves.toEqual(0)
    })

    it("returns 3 for all matches", async () => {
        const s = f([1, 2, 3]).count(() => true)
        await expect(s.pull()).resolves.toEqual(3)
    })

    it("returns count with no predicate", async () => {
        const s = f([1, 2, 3]).count()
        await expect(s.pull()).resolves.toEqual(3)
    })

    it("calls predicate as many times as needed", async () => {
        const fn = jest.fn(() => true)
        const s = f([1, 2, 3]).count(fn)
        await s.pull()
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it("has no side-effects before pull", async () => {
        const fn = jest.fn(function* () {})
        const s = f(fn)
        const lazy = s.count()
        expect(fn).not.toHaveBeenCalled()
        await lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("works with async predicate", async () => {
        const s = f([1, 2, 3]).count(async x => x > 1)
        await expect(s.pull()).resolves.toEqual(2)
    })
})
