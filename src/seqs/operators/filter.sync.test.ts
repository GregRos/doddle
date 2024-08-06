import { declare, type, type_of } from "declare-it"

import type { Seq } from "../../index.js"
import { seq } from "../../index.js"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("element stays the same type with no type predicate", expect => {
    const s = _seq([1, 2, 3]).filter(() => true)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("element type changes with type predicate which is a subtype", expect => {
    const s = _seq([1, 2, 3]).filter(x => x === 2)
    expect(type_of(s)).to_equal(type<_Seq<2>>)
})

declare.it("element type doesn't change if the predicate is for a supertype", expect => {
    const s = _seq([1, 1] as 1[]).filter(x => typeof x === "number")
    expect(type_of(s)).to_equal(type<_Seq<1>>)
})

it("filters out elements", () => {
    const s = _seq([1, 2, 3]).filter(x => x > 1)
    expect(s._qr).toEqual([2, 3])
})

it("filters out elements with index", () => {
    const s = _seq([1, 2, 3]).filter((x, i) => i > 1)
    expect(s._qr).toEqual([3])
})

it("filters out all elements", () => {
    const s = _seq([1, 2, 3]).filter(() => false)
    expect(s._qr).toEqual([])
})

it("filters out no elements", () => {
    const s = _seq([1, 2, 3]).filter(() => true)
    expect(s._qr).toEqual([1, 2, 3])
})

it("has no side-effects, pulls as many as needed", () => {
    const fn = jest.fn(x => x > 1)
    const s = _seq(function* () {
        yield 1
        yield 2
        expect(true).toBe(false)
    }).filter(fn)
    expect(fn).not.toHaveBeenCalled()
    for (const _ of s) {
        break
    }
    expect(fn).toHaveBeenCalledTimes(2)
})

it("calls predicate as many times as needed", () => {
    const fn = jest.fn(x => x > 1)
    const s = _seq([1, 2, 3]).filter(fn)
    for (const _ of s) {
        break
    }
    expect(fn).toHaveBeenCalledTimes(2)
})

it("can iterate twice", () => {
    const s = _seq([1, 2, 3]).filter(x => x > 1)
    expect(s._qr).toEqual([2, 3])
    expect(s._qr).toEqual([2, 3])
})
