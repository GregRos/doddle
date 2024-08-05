import { declare, type, type_of } from "declare-it"
import type { Lazy } from "../../lazy"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
const f = seq
type SType<T> = Seq<T>
declare.test("should type as Lazy<boolean>", expect => {
    expect(type_of(f([1, 2, 3]).every(() => true))).to_equal(type<Lazy<boolean>>)
})
it("returns true for empty", () => {
    const s = f([]).every(() => false)
    expect(s.pull()).toEqual(true)
})

it("returns false for no matches", () => {
    const s = f([1, 2, 3]).every(() => false)
    expect(s.pull()).toEqual(false)
})

it("returns true for all matches", () => {
    const s = f([1, 2, 3]).every(() => true)
    expect(s.pull()).toEqual(true)
})
it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = f(fn)
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
    const tkw = f(sq).every(() => false)
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed when true", () => {
    const fn = jest.fn(() => true)
    const s = f([1, 2, 3]).every(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls predicate as many times as needed when false", () => {
    const fn = jest.fn(() => false)
    const s = f([1, 2, 3]).every(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})
