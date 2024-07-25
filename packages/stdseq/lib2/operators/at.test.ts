import type { Lazy, LazyAsync } from "stdlazy/lib"
import { aseq } from "../wrappers/aseq.ctor"
import { seq } from "../wrappers/seq.ctor"
import { Seq } from "../wrappers/seq.class"
import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../wrappers/aseq.class"

describe("sync", () => {
    const f = seq
    type SType<T> = Seq<T>
    declare.test("correctly typed as Lazy and disjunction with undefined", expect => {
        const s = f([1, 2, 3]).at(0)
        expect(type_of(s)).to_equal(type<Lazy<number | undefined>>)
    })

    it("gets first element", () => {
        const s = f([1, 2, 3]).at(0)
        expect(s.pull()).toEqual(1)
    })

    it("gets last element", () => {
        const s = f([1, 2, 3]).at(2)
        expect(s.pull()).toEqual(3)
    })

    it("gets undefined for out of bounds", () => {
        const s = f([1, 2, 3]).at(3)
        expect(s.pull()).toEqual(undefined)
    })

    it("gets last item for negative index", () => {
        const s = f([1, 2, 3]).at(-1)
        expect(s.pull()).toEqual(3)
    })

    it("gets first item for negative index", () => {
        const s = f([1, 2, 3]).at(-3)
        expect(s.pull()).toEqual(1)
    })

    it("has no side-effects before pull", () => {
        const fn = jest.fn(function* () {})
        const s = f(fn)
        const lazy = s.at(0)
        expect(fn).not.toHaveBeenCalled()
        lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })
})

describe("sync", () => {
    const f = aseq
    type SType<T> = ASeq<T>
    declare.test("correctly typed as LazyAsync and disjunction with undefined", expect => {
        const s = f([1, 2, 3]).at(0)
        expect(type_of(s)).to_equal(type<LazyAsync<number | undefined>>)
    })

    it("gets first element", () => {
        const s = f([1, 2, 3]).at(0)
        expect(s.pull()).resolves.toEqual(1)
    })

    it("gets last element", () => {
        const s = f([1, 2, 3]).at(2)
        expect(s.pull()).resolves.toEqual(3)
    })

    it("gets undefined for out of bounds", () => {
        const s = f([1, 2, 3]).at(3)
        expect(s.pull()).resolves.toEqual(undefined)
    })

    it("gets last item for negative index", () => {
        const s = f([1, 2, 3]).at(-1)
        expect(s.pull()).resolves.toEqual(3)
    })

    it("gets first item for negative index", () => {
        const s = f([1, 2, 3]).at(-3)
        expect(s.pull()).resolves.toEqual(1)
    })

    it("has no side-effects before pull", async () => {
        const fn = jest.fn(async function* () {})
        const s = f(fn)
        const lazy = s.at(0)
        expect(fn).not.toHaveBeenCalled()
        await lazy.pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })
})
