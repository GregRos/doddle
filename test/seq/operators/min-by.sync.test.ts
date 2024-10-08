import type { Doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

import { doddle, seq } from "@lib"
const _seq = seq

declare.test("should type as Doddle<T | undefined>", expect => {
    expect(type_of(_seq([1, 2, 3]).minBy(() => true))).to_equal(type<Doddle<number | undefined>>)
})
declare.test("should type as Doddle<T | string> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).minBy(() => true, "alt" as string))).to_equal(
        type<Doddle<number | string>>
    )
})
declare.test("should type as Doddle<T | 'alt'> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).minBy(() => true, "alt"))).to_equal(type<Doddle<number | "alt">>)
})

it("returns undefined for empty", () => {
    const s = _seq([]).minBy(() => true)
    expect(s.pull()).toEqual(undefined)
})

it("sorted input", () => {
    const s = _seq([1, 2, 3]).minBy(x => x)
    expect(s.pull()).toEqual(1)
})

it("unsorted input", () => {
    const s = _seq([3, 1, 2]).minBy(x => x)
    expect(s.pull()).toEqual(1)
})

it("returns first value for same input", () => {
    const s = _seq([1, 2, 3]).minBy(() => true)
    expect(s.pull()).toEqual(1)
})

it("returns alt for empty sequence", () => {
    const s = _seq([]).minBy(() => false, "alt")
    expect(s.pull()).toEqual("alt")
})

it("returns undefined if no alt", () => {
    const s = _seq([]).minBy(() => false)
    expect(s.pull()).toEqual(undefined)
})

it("no side-effects before pull", () => {
    const fn = jest.fn(function* () {
        yield 1
    })
    const s = _seq(fn)
    const doddle = s.minBy(() => true)
    expect(fn).not.toHaveBeenCalled()
    doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("calls iteratee as many times as needed", () => {
    const fn = jest.fn(x => x)
    const s = _seq([1, 2, 3]).minBy(fn)
    expect(fn).not.toHaveBeenCalled()
    s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("no calls for empty sequence", () => {
    const fn = jest.fn(x => x)
    const s = _seq([]).minBy(fn)
    expect(fn).not.toHaveBeenCalled()
    s.pull()
    expect(fn).not.toHaveBeenCalled()
})

it("returns first min value", () => {
    const s = _seq([3, 1, 3, 1]).minBy(x => x)
    expect(s.pull()).toEqual(1)
})

it("doesn't error for non-comparable keys", () => {
    expect(() =>
        _seq([1, 2, 3])
            .minBy(_ => {})
            .pull()
    ).not.toThrow()
})

it("iteratee receives index", () => {
    const s = _seq([1, 2, 3]).minBy((x, i) => {
        expect(i).toBe(x - 1)
        return x
    })
    expect(s.pull()).toEqual(1)
})

it("doddle result is pulled", () => {
    const s = _seq([2, 1, 3]).minBy(x => doddle(() => x))
    expect(s.pull()).toEqual(1)
})
