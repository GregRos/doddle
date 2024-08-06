import { type Lazy } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
const _seq = seq
declare.it("is typed correctly", expect => {
    const s = _seq([1, 2, 3]).toSet()
    expect(type_of(s)).to_equal(type<Lazy<Set<number>>>)
})

declare.it("is typed correctly for mixed types", expect => {
    const s = _seq([1, "two", true]).toSet()
    expect(type_of(s)).to_equal(type<Lazy<Set<string | number | boolean>>>)
})

it("converts to set", () => {
    const s = _seq([1, 2, 3]).toSet()
    expect(s.pull()).toEqual(new Set([1, 2, 3]))
})

it("converts empty to empty", () => {
    const s = _seq([]).toSet()
    expect(s.pull()).toEqual(new Set())
})

it("converts to set with mixed types", () => {
    const s = _seq([1, "two", true]).toSet()
    expect(s.pull()).toEqual(new Set([1, "two", true]))
})

it("handles sequences with duplicate values", () => {
    const s = _seq([1, 2, 1, 2])
    expect(s.toSet().pull()).toEqual(new Set([1, 2]))
})

it("produces set twice", () => {
    const fn = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
    })
    const s = _seq(fn)
    expect(s.toSet().pull()).toEqual(new Set([1, 2, 3]))
    expect(s.toSet().pull()).toEqual(new Set([1, 2, 3]))
    expect(fn).toHaveBeenCalledTimes(2)
})
