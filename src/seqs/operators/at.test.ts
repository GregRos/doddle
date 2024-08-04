import { declare, type, type_of } from "declare-it"
import type { Lazy, LazyAsync } from "../../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"

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

    it("gets first element", async () => {
        const s = f([1, 2, 3]).at(0)
        await expect(s.pull()).resolves.toEqual(1)
    })

    it("gets last element", async () => {
        const s = f([1, 2, 3]).at(2)
        await expect(s.pull()).resolves.toEqual(3)
    })

    it("gets undefined for out of bounds", async () => {
        const s = f([1, 2, 3]).at(3)
        await expect(s.pull()).resolves.toEqual(undefined)
    })

    it("gets last item for negative index", async () => {
        const s = f([1, 2, 3]).at(-1)
        await expect(s.pull()).resolves.toEqual(3)
    })

    it("gets first item for negative index", async () => {
        const s = f([1, 2, 3]).at(-3)
        await expect(s.pull()).resolves.toEqual(1)
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
