import { declare, type, type_of } from "declare-it"
import type { Lazy } from "@lib"

import { seq } from "@lib"
const _seq = seq
declare.test("should type as Lazy<number>", expect => {
    expect(type_of(_seq([1, 2, 3]).count(() => true))).to_equal(type<Lazy<number>>)
    expect(type_of(_seq([1, 2, 3]).count())).to_equal(type<Lazy<number>>)
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
    const lazy = s.count()
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", () => {
    const fn = jest.fn(() => true)
    const s = _seq([1, 2, 3]).count(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})
