import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "../.."
import { aseq } from "../.."
const _seq = aseq
declare.test("should type as Lazy<number>", expect => {
    expect(type_of(_seq([1, 2, 3]).count(() => true))).to_equal(type<LazyAsync<number>>)
    expect(type_of(_seq([1, 2, 3]).count())).to_equal(type<LazyAsync<number>>)
})
it("returns 0 for empty", async () => {
    const s = _seq([]).count(() => true)
    await expect(s.pull()).resolves.toEqual(0)
})

it("returns 0 for no matches", async () => {
    const s = _seq([1, 2, 3]).count(() => false)
    await expect(s.pull()).resolves.toEqual(0)
})

it("returns 3 for all matches", async () => {
    const s = _seq([1, 2, 3]).count(() => true)
    await expect(s.pull()).resolves.toEqual(3)
})

it("returns count with no predicate", async () => {
    const s = _seq([1, 2, 3]).count()
    await expect(s.pull()).resolves.toEqual(3)
})

it("calls predicate as many times as needed", async () => {
    const fn = jest.fn(() => true)
    const s = _seq([1, 2, 3]).count(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const lazy = s.count()
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works with async predicate", async () => {
    const s = _seq([1, 2, 3]).count(async x => x > 1)
    await expect(s.pull()).resolves.toEqual(2)
})
