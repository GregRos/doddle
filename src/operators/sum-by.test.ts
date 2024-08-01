import { declare, type, type_of } from "declare-it"
import type { Lazy, LazyAsync } from "../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
// test sync `minBy` function
describe("sync", () => {
    const _seq = seq
    type SType<T> = Seq<T>

    declare.test("should type as Lazy<number>", expect => {
        expect(type_of(_seq([1, 2, 3]).sumBy(() => 1))).to_equal(type<Lazy<number>>)
    })
    it("returns 0 for empty", () => {
        const s = _seq([]).sumBy(() => 1)
        expect(s.pull()).toEqual(0)
    })

    it("sums input", () => {
        const s = _seq([1, 2, 3]).sumBy(x => x)
        expect(s.pull()).toEqual(6)
    })

    it("no side-effects before pull", () => {
        const fn = jest.fn(function* () {})
        const s = _seq(fn)
        const lazy = s.sumBy(() => 1)
        expect(fn).not.toHaveBeenCalled()
        lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })
})

// test async `sumBy` function
describe("async", () => {
    const f = aseq
    type SType<T> = ASeq<T>

    declare.test("should type as LazyAsync<number>", expect => {
        expect(type_of(f([1, 2, 3]).sumBy(() => 1))).to_equal(type<LazyAsync<number>>)
    })

    it("returns 0 for empty", async () => {
        const s = f([]).sumBy(() => 1)
        expect(await s.pull()).toEqual(0)
    })

    it("sums input", async () => {
        const s = f([1, 2, 3]).sumBy(x => x)
        expect(await s.pull()).toEqual(6)
    })

    it("no side-effects before pull", async () => {
        const fn = jest.fn(async function* () {})
        const s = f(fn)
        const lazy = s.sumBy(() => 1)
        expect(fn).not.toHaveBeenCalled()
        await lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("works for async iteratee", async () => {
        const s = f([1, 2, 3]).sumBy(async x => x)
        expect(await s.pull()).toEqual(6)
    })
})
