import type { DoddleAsync } from "@lib"
import { aseq, doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq

declare.test("should type as DoddleAsync<number>", expect => {
    expect(type_of(_seq([1, 2, 3]).sumBy(() => 1))).to_equal(type<DoddleAsync<number>>)
})

declare.test("allows doddle iteratee", expect => {
    const s = _seq([1, 2, 3]).sumBy(() => doddle(() => 1))
    expect(type_of(s)).to_equal(type<DoddleAsync<number>>)
})

declare.test("allows doddle async iteratee", expect => {
    const s = _seq([1, 2, 3]).sumBy(() => doddle(async () => 1))
    expect(type_of(s)).to_equal(type<DoddleAsync<number>>)
})

declare.test("allows async doddle async iteratee", expect => {
    const s = _seq([1, 2, 3]).sumBy(async () => doddle(async () => 1))
    expect(type_of(s)).to_equal(type<DoddleAsync<number>>)
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
    const doddle = s.sumBy(() => 1)
    expect(fn).not.toHaveBeenCalled()
    await doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works for async iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(async x => x)
    expect(await s.pull()).toEqual(6)
})

it("works for doddle iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(() => doddle(() => 1))
    expect(await s.pull()).toEqual(3)
})

it("works for doddle async iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(() => doddle(async () => 1))
    expect(await s.pull()).toEqual(3)
})

it("works for async doddle async iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(async () => doddle(async () => 1))
    expect(await s.pull()).toEqual(3)
})

it("works for async doddle iteratee", async () => {
    const s = _seq([1, 2, 3]).sumBy(async () => doddle(() => 1))
    expect(await s.pull()).toEqual(3)
})
