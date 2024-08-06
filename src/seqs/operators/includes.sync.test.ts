import { declare, type, type_of } from "declare-it"
import type { Lazy } from "../.."

import { seq } from "../.."
const _seq = seq
declare.test("should type as Lazy<boolean>", expect => {
    expect(type_of(_seq([1, 2, 3]).includes(1))).to_equal(type<Lazy<boolean>>)
})
it("returns false for empty", () => {
    const s = _seq([]).includes(1)
    expect(s.pull()).toEqual(false)
})

it("returns false for no matches", () => {
    const s = _seq([1, 2, 3]).includes(4)
    expect(s.pull()).toEqual(false)
})

it("returns true for match", () => {
    const s = _seq([1, 2, 3]).includes(2)
    expect(s.pull()).toEqual(true)
})
it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const lazy = s.includes(1)
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).includes(1)
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})
