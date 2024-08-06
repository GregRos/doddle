import type { Lazy } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
declare.it("should type as Lazy<boolean>", expect => {
    expect(type_of(seq([1, 2, 3]).some(() => true))).to_equal(type<Lazy<boolean>>)
})

it("returns false for empty", () => {
    const s = seq([]).some(() => true)
    expect(s.pull()).toEqual(false)
})

it("returns false for no matches", () => {
    const s = seq([1, 2, 3]).some(() => false)
    expect(s.pull()).toEqual(false)
})

it("returns true for any matches", () => {
    const s = seq([1, 2, 3]).some(() => true)
    expect(s.pull()).toEqual(true)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = seq(fn)
    const lazy = s.some(() => true)
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})
