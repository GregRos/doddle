import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "../../index.js"
import { aseq } from "../../index.js"

const _seq = aseq

declare.test("should type as LazyAsync<number>", expect => {
    expect(type_of(_seq([1, 2, 3]).sumBy(() => 1))).to_equal(type<LazyAsync<number>>)
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
