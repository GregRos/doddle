import type { LazyAsync } from "@lib"
import { aseq, lazy } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq

declare.test("should type as LazyAsync<number>", expect => {
    expect(type_of(_seq([1, 2, 3]).sumBy(() => 1))).to_equal(type<LazyAsync<number>>)
})

declare.test("allows lazy iteratee", expect => {
    const s = _seq([1, 2, 3]).sumBy(() => lazy(() => 1))
    expect(type_of(s)).to_equal(type<LazyAsync<number>>)
})

declare.test("allows lazy async iteratee", expect => {
    const s = _seq([1, 2, 3]).sumBy(() => lazy(async () => 1))
    expect(type_of(s)).to_equal(type<LazyAsync<number>>)
})

declare.test("allows async lazy async iteratee", expect => {
    const s = _seq([1, 2, 3]).sumBy(async () => lazy(async () => 1))
    expect(type_of(s)).to_equal(type<LazyAsync<number>>)
})

it("returns 0 for empty", async () => {
    const s = _seq([]).sumBy(() => 1)
    expect(await s.pull()).toEqual(0)
})

it("sums input", async () => {
    const s = _seq([1, 2, 3]).sumBy(x => x)
    expect(await s.pull()).toEqual(6)
})

it("no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
    const lazy = s.sumBy(() => 1)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works for async iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(async x => x)
    expect(await s.pull()).toEqual(6)
})

it("works for lazy iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(() => lazy(() => 1))
    expect(await s.pull()).toEqual(3)
})

it("works for lazy async iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(() => lazy(async () => 1))
    expect(await s.pull()).toEqual(3)
})

it("works for async lazy async iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(async () => lazy(async () => 1))
    expect(await s.pull()).toEqual(3)
})

it("works for async lazy iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(async () => lazy(() => 1))
    expect(await s.pull()).toEqual(3)
})
