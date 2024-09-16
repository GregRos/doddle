import type { Doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

import { doddle, seq } from "@lib"
const _seq = seq
declare.test("should type as Doddle<number>", expect => {
    expect(type_of(_seq([1, 2, 3]).count(() => true))).to_equal(type<Doddle<number>>)
    expect(type_of(_seq([1, 2, 3]).count())).to_equal(type<Doddle<number>>)
})
it("returns 0 for empty", () => {
    const s = _seq([]).count(() => true)
    expect(s.pull()).toEqual(0)
})

it("returns 0 for no matches", () => {
    const s = _seq([1, 2, 3]).count(() => false)
    expect(s.pull()).toEqual(0)
})

it("returns 3 for all matches", () => {
    const s = _seq([1, 2, 3]).count(() => true)
    expect(s.pull()).toEqual(3)
})

it("returns count with no predicate", () => {
    const s = _seq([1, 2, 3]).count()
    expect(s.pull()).toEqual(3)
})
it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const doddle = s.count()
    expect(fn).not.toHaveBeenCalled()
    doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", () => {
    const fn = jest.fn(() => true)
    const s = _seq([1, 2, 3]).count(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("works with doddle predicate", () => {
    const s = _seq([1, 2, 3]).count(i => doddle(() => i % 2 === 0))
    expect(s.pull()).toEqual(1)
})
