import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "../.."
import { aseq } from "../.."

const _seq = aseq
declare.test("should type as Lazy<boolean>", expect => {
    expect(type_of(_seq([1, 2, 3]).every(() => true))).to_equal(type<LazyAsync<boolean>>)
})
it("returns true for empty", async () => {
    const s = _seq([]).every(() => false)
    expect(await s.pull()).toEqual(true)
})

it("returns false for no matches", async () => {
    const s = _seq([1, 2, 3]).every(() => false)
    expect(await s.pull()).toEqual(false)
})

it("returns true for all matches", async () => {
    const s = _seq([1, 2, 3]).every(() => true)
    expect(await s.pull()).toEqual(true)
})
it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
    const lazy = s.every(() => true)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed when false", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).every(() => false)
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed when true", async () => {
    const fn = jest.fn(() => true)
    const s = _seq([1, 2, 3]).every(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls predicate as many times as needed when false", async () => {
    const fn = jest.fn(() => false)
    const s = _seq([1, 2, 3]).every(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works for async predicates (true)", async () => {
    const s = _seq([1, 2, 3]).every(async x => x !== 4)
    expect(await s.pull()).toEqual(true)
})

it("works for async predicates (false)", async () => {
    const s = _seq([1, 2, 3]).every(async x => x !== 2)
    expect(await s.pull()).toEqual(false)
})
