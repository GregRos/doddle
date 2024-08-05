import { declare, type, type_of } from "declare-it"
import type { Lazy } from "../../lazy"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
const f = seq
type SType<T> = Seq<T>

declare.it("correctly typed as Lazy and disjunction with undefined if no alt", expect => {
    const s = f([1, 2, 3]).first()
    expect(type_of(s)).to_equal(type<Lazy<number | undefined>>)
})

declare.it("disjunction with alt if it's given", expect => {
    const s = f([1, 2, 3]).first("alt" as string)
    expect(type_of(s)).to_equal(type<Lazy<number | string>>)
})

declare.it("Alt type is const", expect => {
    const s = f([1, 2, 3]).first("alt")
    expect(type_of(s)).to_equal(type<Lazy<number | "alt">>)
})

it("gets first element", () => {
    const s = f([1, 2, 3]).first()
    expect(s.pull()).toEqual(1)
})

it("gets undefined for empty", () => {
    const s = f([]).first()
    expect(s.pull()).toEqual(undefined)
})

it("gets alt for empty with alt", () => {
    const s = f([]).first("alt")
    expect(s.pull()).toEqual("alt")
})

it("alt doesn't affect non-empty", () => {
    const s = f([1, 2, 3]).first("alt")
    expect(s.pull()).toEqual(1)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = f(fn)
    const lazy = s.first()
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = f(sq).first()
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})
