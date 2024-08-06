import { declare, type, type_of } from "declare-it"
import type { Lazy } from "@lib"

import { seq } from "@lib"
const _seq = seq

declare.it("correctly typed as Lazy and disjunction with undefined if no alt", expect => {
    const s = _seq([1, 2, 3]).last()
    expect(type_of(s)).to_equal(type<Lazy<number | undefined>>)
})

declare.it("disjunction with alt if it's given", expect => {
    const s = _seq([1, 2, 3]).last("alt" as string)
    expect(type_of(s)).to_equal(type<Lazy<number | string>>)
})

declare.it("Alt type is const", expect => {
    const s = _seq([1, 2, 3]).last("alt")
    expect(type_of(s)).to_equal(type<Lazy<number | "alt">>)
})

it("gets last element", () => {
    const s = _seq([1, 2, 3]).last()
    expect(s.pull()).toEqual(3)
})

it("gets undefined for empty", () => {
    const s = _seq([]).last()
    expect(s.pull()).toEqual(undefined)
})

it("gets alt for empty with alt", () => {
    const s = _seq([]).last("alt")
    expect(s.pull()).toEqual("alt")
})

it("alt doesn't affect non-empty", () => {
    const s = _seq([1, 2, 3]).last("alt")
    expect(s.pull()).toEqual(3)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const lazy = s.last()
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1) // Only generates values when necessary
})

it("pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
        expect(true).toBe(true) // Ensures entire sequence is evaluated to get the last element
    })
    const tkw = _seq(sq).last()
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1) // Ensures generator is called to exhaust values for the last element
})
