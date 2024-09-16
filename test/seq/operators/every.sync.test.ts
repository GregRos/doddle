import type { Doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

import { doddle, seq } from "@lib"
const _seq = seq
declare.test("should type as Lazy<boolean>", expect => {
    expect(type_of(_seq([1, 2, 3]).every(() => true))).to_equal(type<Doddle<boolean>>)
})
it("returns true for empty", () => {
    const s = _seq([]).every(() => false)
    expect(s.pull()).toEqual(true)
})

it("returns false for no matches", () => {
    const s = _seq([1, 2, 3]).every(() => false)
    expect(s.pull()).toEqual(false)
})

it("returns true for all matches", () => {
    const s = _seq([1, 2, 3]).every(() => true)
    expect(s.pull()).toEqual(true)
})
it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const lazy = s.every(() => true)
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed when false", () => {
    const sq = jest.fn(function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).every(() => false)
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed when true", () => {
    const fn = jest.fn(() => true)
    const s = _seq([1, 2, 3]).every(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls predicate as many times as needed when false", () => {
    const fn = jest.fn(() => false)
    const s = _seq([1, 2, 3]).every(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works with lazy predicate", () => {
    const s = _seq([1, 2, 3]).every(x => doddle(() => x % 2 === 0))
    expect(s.pull()).toEqual(false)
})
