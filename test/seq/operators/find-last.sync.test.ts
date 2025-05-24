import type { Doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

import { doddle, seq } from "@lib"
const _seq = seq
declare.test("should type as Doddle<T | undefined>", expect => {
    expect(type_of(_seq([1, 2, 3]).last(() => true))).to_equal(type<Doddle<number | undefined>>)
})
declare.test("should type as Doddle<T | string> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).last(() => true, "alt" as string))).to_equal(
        type<Doddle<number | string>>
    )
})
declare.test("should type as Doddle<T | 'alt'> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).last(() => true, "alt"))).to_equal(type<Doddle<number | "alt">>)
})

it("returns undefined for empty", () => {
    const s = _seq([]).last(() => true)
    expect(s.pull()).toEqual(undefined)
})

it("returns undefined for no matches", () => {
    const s = _seq([1, 2, 3]).last(() => false)
    expect(s.pull()).toEqual(undefined)
})

it("returns alt for no matches with alt", () => {
    const s = _seq([1, 2, 3]).last(() => false, "alt")
    expect(s.pull()).toEqual("alt")
})

it("returns last match", () => {
    const s = _seq([1, 2, 3, 4]).last(() => true)
    expect(s.pull()).toEqual(4)
})

it("returns last match even with alt", () => {
    const s = _seq([1, 2, 3, 4]).last(() => true, 10)
    expect(s.pull()).toEqual(4)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const doddle = s.last(() => true)
    expect(fn).not.toHaveBeenCalled()
    doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
    })
    const tkw = _seq(sq).last(() => true)
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", () => {
    const fn = jest.fn(x => x === 3)
    const s = _seq([1, 2, 3, 4, 3]).last(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(5)
})

it("works with doddle predicate", () => {
    const s = _seq([1, 2, 3]).last(x => doddle(() => x % 2 === 0))
    expect(s.pull()).toEqual(2)
})
