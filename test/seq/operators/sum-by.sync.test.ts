import type { Doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

import { doddle, seq } from "@lib"
const _seq = seq

declare.test("should type as Doddle<number>", expect => {
    expect(type_of(_seq([1, 2, 3]).sumBy(() => 1))).to_equal(type<Doddle<number>>)
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
    const doddle = s.sumBy(() => 1)
    expect(fn).not.toHaveBeenCalled()
    doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works with doddle projection", () => {
    const s = _seq([1, 2, 3]).sumBy(() => doddle(() => 1))
    expect(s.pull()).toEqual(3)
})
