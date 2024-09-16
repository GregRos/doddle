import { declare, type, type_of } from "declare-it"

import type { Doddle, Seq } from "@lib"
import { doddle, seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("element type the same with id proejction", expect => {
    const s = _seq([1, 2, 3]).map(x => x)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("lazy result is pulled", expect => {
    const s = _seq([1, 2, 3]).map(x => doddle(() => x))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})
declare.it("disjunction with lazy is also pulled", expect => {
    const s = _seq([1, 2, 3]).map(x => doddle(() => x) as number | Doddle<number>)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})
declare.it("generic - lazy result is pulled", expect => {
    function _<T>(x: Doddle<T>) {
        expect(type_of(_seq([1, 2, 3]).map(() => doddle(() => x)))).to_equal(type<_Seq<T>>)
    }
    function __<T>(x: T | Doddle<T>) {
        expect(type_of(_seq([1, 2, 3]).map(() => doddle(() => x)))).to_equal(type<_Seq<T>>)
    }
})

declare.it("element type changes", expect => {
    const s = _seq([1, 2, 3]).map(x => x + "")
    expect(type_of(s)).to_equal(type<_Seq<string>>)
})

it("maps elements", () => {
    const s = _seq([1, 2, 3]).map(x => x + 1)
    expect(s._qr).toEqual([2, 3, 4])
})

it("maps elements with index", () => {
    const s = _seq([1, 2, 3]).map((x, i) => x + i)
    expect(s._qr).toEqual([1, 3, 5])
})

it("maps all elements to the same value", () => {
    const s = _seq([1, 2, 3]).map(() => 1)
    expect(s._qr).toEqual([1, 1, 1])
})

it("has no side-effects, pulls as many as needed", () => {
    const fn = jest.fn(x => x + 1)
    const s = _seq(function* () {
        yield 1
        yield 2
        expect(true).toBe(false)
    }).map(fn)
    expect(fn).not.toHaveBeenCalled()
    for (const x of s) {
        if (x === 3) {
            break
        }
    }
    expect(fn).toHaveBeenCalledTimes(2)
})

it("calls projection as many times as needed", () => {
    const fn = jest.fn(x => x + 1)
    const s = _seq([1, 2, 3]).map(fn)
    expect(fn).not.toHaveBeenCalled()
    for (const x of s) {
        if (x === 3) {
            break
        }
    }
    expect(fn).toHaveBeenCalledTimes(2)
})

it("can iterate twice", () => {
    const s = _seq([1, 2, 3]).map(x => x + 1)
    expect(s._qr).toEqual([2, 3, 4])
    expect(s._qr).toEqual([2, 3, 4])
})

it("lazy result is pulled", () => {
    const s = _seq([1, 2, 3]).map(x => doddle(() => x))
    expect(s._qr).toEqual([1, 2, 3])
})
