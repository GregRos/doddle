import type { Doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
const _seq = seq

declare.it("correctly typed as Doddle and disjunction with undefined if no alt", expect => {
    const s = _seq([1, 2, 3]).first()
    expect(type_of(s)).to_equal(type<Doddle<number | undefined>>)
})

it("gets first element", () => {
    const s = _seq([1, 2, 3]).first()
    expect(s.pull()).toEqual(1)
})

it("gets undefined for empty", () => {
    const s = _seq([]).first()
    expect(s.pull()).toEqual(undefined)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const doddle = s.first()
    expect(fn).not.toHaveBeenCalled()
    doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).first()
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})
