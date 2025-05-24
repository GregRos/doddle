import type { Doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

import { doddle, seq } from "@lib"
const _seq = seq
declare.test("should type as Doddle<T | undefined>", expect => {
    expect(type_of(_seq([1, 2, 3]).first(() => true))).to_equal(type<Doddle<number | undefined>>)
})
declare.test("should type as Doddle<T | string> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).first(() => true, "alt" as string))).to_equal(
        type<Doddle<number | string>>
    )
})
declare.test("should type as Doddle<T | 'alt'> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).first(() => true, "alt"))).to_equal(type<Doddle<number | "alt">>)
})
it("returns undefined for empty", () => {
    const s = _seq([]).first(() => true)
    expect(s.pull()).toEqual(undefined)
})

it("returns undefined for no matches", () => {
    const s = _seq([1, 2, 3]).first(() => false)
    expect(s.pull()).toEqual(undefined)
})

it("returns alt for no matches with alt", () => {
    const s = _seq([1, 2, 3]).first(() => false, "alt")
    expect(s.pull()).toEqual("alt")
})

it("returns first match", () => {
    const s = _seq([1, 2, 3]).first(() => true)
    expect(s.pull()).toEqual(1)
})

it("returns match even with alt", () => {
    const s = _seq([1, 2, 3]).first(() => true, "alt")
    expect(s.pull()).toEqual(1)
})

it("returns match even if not first", () => {
    const s = _seq([1, 2, 3]).first(x => x === 3, "alt")
    expect(s.pull()).toEqual(3)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const doddle = s.first(() => true)
    expect(fn).not.toHaveBeenCalled()
    doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).first(() => true)
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", () => {
    const fn = jest.fn(() => true)
    const s = _seq([1, 2, 3]).first(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works with doddle predicate", () => {
    const s = _seq([1, 2, 3]).first(x => doddle(() => x % 2 === 0))
    expect(s.pull()).toEqual(2)
})
