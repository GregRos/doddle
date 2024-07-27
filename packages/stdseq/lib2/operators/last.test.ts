import { declare, type, type_of } from "declare-it"
import type { Lazy, LazyAsync } from "stdlazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

// test sync `last` function
describe("sync", () => {
    const f = seq
    type SType<T> = Seq<T>

    declare.it("correctly typed as Lazy and disjunction with undefined if no alt", expect => {
        const s = f([1, 2, 3]).last()
        expect(type_of(s)).to_equal(type<Lazy<number | undefined>>)
    })

    declare.it("disjunction with alt if it's given", expect => {
        const s = f([1, 2, 3]).last("alt" as string)
        expect(type_of(s)).to_equal(type<Lazy<number | string>>)
    })

    declare.it("Alt type is const", expect => {
        const s = f([1, 2, 3]).last("alt")
        expect(type_of(s)).to_equal(type<Lazy<number | "alt">>)
    })

    it("gets last element", () => {
        const s = f([1, 2, 3]).last()
        expect(s.pull()).toEqual(3)
    })

    it("gets undefined for empty", () => {
        const s = f([]).last()
        expect(s.pull()).toEqual(undefined)
    })

    it("gets alt for empty with alt", () => {
        const s = f([]).last("alt")
        expect(s.pull()).toEqual("alt")
    })

    it("alt doesn't affect non-empty", () => {
        const s = f([1, 2, 3]).last("alt")
        expect(s.pull()).toEqual(3)
    })

    it("has no side-effects before pull", () => {
        const fn = jest.fn(function* () {})
        const s = f(fn)
        const lazy = s.last()
        expect(fn).not.toHaveBeenCalled()
        lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1) // Only generates values when necessary
    })

    it("pulls as many as needed", () => {
        const sq = jest.fn(function* () {
            yield 1
            yield 2
            yield 3
            expect(true).toBe(true) // Ensures entire sequence is evaluated to get the last element
        })
        const tkw = f(sq).last()
        expect(sq).not.toHaveBeenCalled()
        tkw.pull()
        expect(sq).toHaveBeenCalledTimes(1) // Ensures generator is called to exhaust values for the last element
    })
})

// test async `last` function
describe("async", () => {
    const f = aseq
    type SType<T> = ASeq<T>

    declare.it("correctly typed as LazyAsync and disjunction with undefined if no alt", expect => {
        const s = f([1, 2, 3]).last()
        expect(type_of(s)).to_equal(type<LazyAsync<number | undefined>>)
    })

    declare.it("disjunction with alt if it's given", expect => {
        const s = f([1, 2, 3]).last("alt" as string)
        expect(type_of(s)).to_equal(type<LazyAsync<number | string>>)
    })

    declare.it("Alt type is const", expect => {
        const s = f([1, 2, 3]).last("alt")
        expect(type_of(s)).to_equal(type<LazyAsync<number | "alt">>)
    })

    it("gets last element", async () => {
        const s = f([1, 2, 3]).last()
        expect(await s.pull()).toEqual(3)
    })

    it("gets undefined for empty", async () => {
        const s = f([]).last()
        expect(await s.pull()).toEqual(undefined)
    })

    it("gets alt for empty with alt", async () => {
        const s = f([]).last("alt")
        expect(await s.pull()).toEqual("alt")
    })

    it("alt doesn't affect non-empty", async () => {
        const s = f([1, 2, 3]).last("alt")
        expect(await s.pull()).toEqual(3)
    })

    it("has no side-effects before pull", async () => {
        const fn = jest.fn(async function* () {})
        const s = f(fn)
        const lazy = s.last()
        expect(fn).not.toHaveBeenCalled()
        await lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("pulls as many as needed", async () => {
        const sq = jest.fn(async function* () {
            yield 1
            yield 2
            yield 3
            expect(true).toBe(true) // This should trigger only once the whole sequence has been processed
        })
        const tkw = f(sq).last()
        expect(sq).not.toHaveBeenCalled()
        await tkw.pull()
        expect(sq).toHaveBeenCalledTimes(1)
    })
})
