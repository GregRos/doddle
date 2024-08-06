import { declare, type, type_of } from "declare-it"
import type { Seq } from "../../index.js"

import { seq } from "../../index.js"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("should type as _Seq<T>", expect => {
    expect(type_of(_seq([1, 2, 3]).each(() => {}))).to_equal(type<_Seq<number>>)
})

declare.it("can be called with no stages", expect => {
    const s = _seq([1, 2, 3]).each(() => {})
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("can be called with before, after, both, or undefined", expect => {
    const s = _seq([1, 2, 3])
    expect(type_of(s.each(() => {}, "before"))).to_equal(type<_Seq<number>>)
    expect(type_of(s.each(() => {}, "after"))).to_equal(type<_Seq<number>>)
    expect(type_of(s.each(() => {}, "both"))).to_equal(type<_Seq<number>>)
    expect(type_of(s.each(() => {}, undefined))).to_equal(type<_Seq<number>>)
})

declare.it("can't be called with other strings", expect => {
    // @ts-expect-error
    _seq([1, 2, 3]).each(() => {}, "other")
})

it("calls iteratee with after", () => {
    const fn = jest.fn()
    const e = _seq([1, 2, 3]).each(fn, "after")
    expect(fn).not.toHaveBeenCalled()

    for (const x of e) {
        expect(fn).toHaveBeenCalledTimes(x - 1)
        if (x !== 1) {
            expect(fn).toHaveBeenLastCalledWith(x - 1, x - 2, "after")
        }
    }
    expect(fn).toHaveBeenLastCalledWith(3, 2, "after")
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls iteratee with before", () => {
    const fn = jest.fn()
    const e = _seq([1, 2, 3]).each(fn, "before")
    expect(fn).not.toHaveBeenCalled()

    for (const x of e) {
        expect(fn).toHaveBeenCalledTimes(x)
        expect(fn).toHaveBeenLastCalledWith(x, x - 1, "before")
    }
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls iteratee with both", () => {
    const fn = jest.fn()
    const e = _seq([1, 2, 3]).each(fn, "both")
    expect(fn).not.toHaveBeenCalled()
    for (const x of e) {
        expect(fn).toHaveBeenCalledTimes(2 * x - 1)
        expect(fn).toHaveBeenLastCalledWith(x, x - 1, "before")
        if (x !== 1) {
            expect(fn).toHaveBeenCalledWith(x - 1, x - 2, "after")
        }
    }
    expect(fn).toHaveBeenCalledTimes(6)
    expect(fn).toHaveBeenLastCalledWith(3, 2, "after")
})

it("defaults to before", () => {
    const fn = jest.fn()
    for (const x of _seq([1, 2, 3]).each(fn)) {
        expect(fn).toHaveBeenCalledTimes(x)
    }
    expect(fn).toHaveBeenCalledTimes(3)
})

it("errors immediately if iteratee is not a function", () => {
    // @ts-expect-error
    expect(() => _seq([1, 2, 3]).each(1)).toThrow()
})

it("errors immediately if stage is not a valid string", () => {
    // @ts-expect-error
    expect(() => _seq([1, 2, 3]).each(() => {}, "other")).toThrow()
})

it("can iterate twice", () => {
    const fn = jest.fn()
    const e = _seq([1, 2, 3]).each(fn)
    for (const x of e) {
        expect(fn).toHaveBeenCalledTimes(x)
        expect(fn).toHaveBeenLastCalledWith(x, x - 1, "before")
    }
    for (const x of e) {
        expect(fn).toHaveBeenCalledTimes(3 + x)
        expect(fn).toHaveBeenLastCalledWith(x, x - 1, "before")
    }
})
