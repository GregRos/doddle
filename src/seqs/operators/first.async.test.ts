import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "@lib"
import { aseq } from "@lib"

const _seq = aseq

declare.it("correctly typed as LazyAsync and disjunction with undefined if no alt", expect => {
    const s = _seq([1, 2, 3]).first()
    expect(type_of(s)).to_equal(type<LazyAsync<number | undefined>>)
})

declare.it("disjunction with alt if it's given", expect => {
    const s = _seq([1, 2, 3]).first("alt" as string)
    expect(type_of(s)).to_equal(type<LazyAsync<number | string>>)
})

declare.it("Alt type is const", expect => {
    const s = _seq([1, 2, 3]).first("alt")
    expect(type_of(s)).to_equal(type<LazyAsync<number | "alt">>)
})

it("gets first element", async () => {
    const s = _seq([1, 2, 3]).first()
    expect(await s.pull()).toEqual(1)
})

it("gets undefined for empty", async () => {
    const s = _seq([]).first()
    expect(await s.pull()).toEqual(undefined)
})

it("gets alt for empty with alt", async () => {
    const s = _seq([]).first("alt")
    expect(await s.pull()).toEqual("alt")
})

it("alt doesn't affect non-empty", async () => {
    const s = _seq([1, 2, 3]).first("alt")
    expect(await s.pull()).toEqual(1)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
    const lazy = s.first()
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).first()
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})
