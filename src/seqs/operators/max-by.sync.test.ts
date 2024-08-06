import { declare, type, type_of } from "declare-it"
import type { Lazy } from "../../index.js"

import { seq } from "../../index.js"
const _seq = seq
declare.test("should type as Lazy<T | undefined>", expect => {
    expect(type_of(_seq([1, 2, 3]).maxBy(() => true))).to_equal(type<Lazy<number | undefined>>)
})
declare.test("should type as Lazy<T | string> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).maxBy(() => true, "alt" as string))).to_equal(
        type<Lazy<number | string>>
    )
})
declare.test("should type as Lazy<T | 'alt'> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).maxBy(() => true, "alt"))).to_equal(type<Lazy<number | "alt">>)
})
it("returns undefined for empty", () => {
    const s = _seq([]).maxBy(() => true)
    expect(s.pull()).toEqual(undefined)
})

it("sorted input", () => {
    const s = _seq([1, 2, 3]).maxBy(x => x)
    expect(s.pull()).toEqual(3)
})

it("unsorted input", () => {
    const s = _seq([3, 1, 2]).maxBy(x => x)
    expect(s.pull()).toEqual(3)
})

it("returns first value for same input", () => {
    const s = _seq([1, 2, 3]).maxBy(() => true)
    expect(s.pull()).toEqual(1)
})

it("returns alt for empty sequence", () => {
    const s = _seq([]).maxBy(() => false, "alt")
    expect(s.pull()).toEqual("alt")
})

it("returns undefined if no alt", () => {
    const s = _seq([]).maxBy(() => false)
    expect(s.pull()).toEqual(undefined)
})

it("no side-effects before pull", () => {
    const fn = jest.fn(function* () {
        yield 1
    })
    const s = _seq(fn)
    const lazy = s.maxBy(() => true)
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("calls iteratee as many times as needed", () => {
    const fn = jest.fn(x => x)
    const s = _seq([1, 2, 3]).maxBy(fn)
    expect(fn).not.toHaveBeenCalled()
    s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("no calls for empty sequence", () => {
    const fn = jest.fn(x => x)
    const s = _seq([]).maxBy(fn)
    expect(fn).not.toHaveBeenCalled()
    s.pull()
    expect(fn).not.toHaveBeenCalled()
})

it("returns first max value", () => {
    const s = _seq([1, 2, 3, 2]).maxBy(x => x)
    expect(s.pull()).toEqual(3)
})

it("doesn't error for non-comparable keys", () => {
    expect(() =>
        _seq([1, 2, 3])
            .maxBy(_ => {})
            .pull()
    ).not.toThrow()
})

it("iteratee receives index", () => {
    const s = _seq([1, 2, 3]).maxBy((x, i) => {
        expect(i).toBe(x - 1)
        return x
    })
    expect(s.pull()).toEqual(3)
})
