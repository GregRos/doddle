import type { Doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
const _seq = seq
declare.it("is typed correctly", expect => {
    const s = _seq([1, 2, 3]).toArray()
    expect(type_of(s)).to_equal(type<Doddle<number[]>>)
})

declare.it("is typed correctly for mixed types", expect => {
    const s = _seq([1, "two", true]).toArray()
    expect(type_of(s)).to_equal(type<Doddle<(string | number | boolean)[]>>)
})
it("converts to array", () => {
    const s = _seq([1, 2, 3]).toArray()
    expect(s.pull()).toEqual([1, 2, 3])
})

it("converts empty to empty", () => {
    const s = _seq([]).toArray()
    expect(s.pull()).toEqual([])
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const doddle = s.toArray()
    expect(fn).not.toHaveBeenCalled()
    doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("produces array twice", () => {
    const fn = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
    })
    const s = _seq(fn)
    expect(s.toArray().pull()).toEqual([1, 2, 3])
    expect(s.toArray().pull()).toEqual([1, 2, 3])
    expect(fn).toHaveBeenCalledTimes(2)
})
