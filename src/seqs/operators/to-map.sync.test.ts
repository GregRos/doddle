import type { Lazy } from "@lib"
import { declare, type, type_of } from "declare-it"

import { Doddle } from "@error"
import { seq } from "@lib"
const _seq = seq
declare.it("accepts projection to pair", expect => {
    const s = _seq([1, 2, 3]).toMap(x => [x, x])
    expect(type_of(s)).to_equal(type<Lazy<Map<number, number>>>)
})

declare.it("allows projection to readonly pair", expect => {
    const s = _seq([1, 2, 3]).toMap(x => [x, x] as readonly [number, number])
    expect(type_of(s)).to_equal(type<Lazy<Map<number, number>>>)
})

declare.it("accepts projection to pair with different types", expect => {
    const s = _seq([1, 2, 3]).toMap(x => [x, x.toString()])
    expect(type_of(s)).to_equal(type<Lazy<Map<number, string>>>)
})

declare.it("doesn't accept projection to other", expect => {
    // @ts-expect-error
    _seq([1, 2, 3]).toMap(x => x)
})

declare.it("doesn't accept projection to triple", expect => {
    // @ts-expect-error
    _seq([1, 2, 3]).toMap(x => [x, x, x])
})

declare.it("doesn't accept projection to single", expect => {
    // @ts-expect-error
    _seq([1, 2, 3]).toMap(() => [1])
})

declare.it("doesn't accept projection to optional pair", expect => {
    // @ts-expect-error
    _seq([1, 2, 3]).toMap(x => [x, x] as [number, number?])
})

declare.it("doesn't accept projection to union with undefined", expect => {
    // @ts-expect-error
    _seq([1, 2, 3]).toMap(x => [x, x] as [number, number] | undefined)
})

declare.it("is typed correctly for mixed types", expect => {
    const s = _seq([1, "two", true]).toMap(x => [x, x])
    expect(type_of(s)).to_equal(
        type<Lazy<Map<string | number | boolean, string | number | boolean>>>
    )
})

it("converts empty to empty", () => {
    const s = _seq([]).toMap(x => [x, x])
    expect(s.pull()).toEqual(new Map())
})

it("doesn't call projection on empty", () => {
    const fn = jest.fn()
    _seq([]).toMap(fn).pull()
    expect(fn).not.toHaveBeenCalled()
})

it("converts to map", () => {
    const s = _seq([1, 2, 3]).toMap(x => [x, x])
    expect(s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

it("converts to map with mixed types", () => {
    const s = _seq([1, "two", true]).toMap(x => [x, x])
    expect(s.pull()).toEqual(new Map([[1, 1] as any, ["two", "two"], [true, true]]))
})

it("handles sequences with duplicate values", () => {
    const s = _seq([1, 2, 1, 2]).toMap(x => [x, x])
    expect(s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2]
        ])
    )
})

it("keeps last key-value pair when duplicates are encountered", () => {
    const s = _seq([1, 2, 1, 2]).toMap((x, i) => [x, x + i])
    const map = s.pull()
    expect(map.get(1)).toBe(3)
    expect(map.get(2)).toBe(5)
})

it("produces map twice", () => {
    const fn = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
    })
    const s = _seq(fn)
    const refMap = new Map([
        [1, 1],
        [2, 2],
        [3, 3]
    ])
    expect(s.toMap(x => [x, x]).pull()).toEqual(refMap)
    expect(s.toMap(x => [x, x]).pull()).toEqual(refMap)
    expect(fn).toHaveBeenCalledTimes(2)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const lazy = s.toMap(x => [x, x])
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("calls projection as many times as needed", () => {
    const fn = jest.fn(x => [x, x] as const)
    const s = _seq([1, 2, 3]).toMap(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls projection with index", () => {
    const fn = jest.fn((x, i) => [x, i] as any)
    const s = _seq([1, 2, 3]).toMap(fn)
    s.pull()
    expect(fn).toHaveBeenCalledWith(1, 0)
    expect(fn).toHaveBeenCalledWith(2, 1)
    expect(fn).toHaveBeenCalledWith(3, 2)
})

describe("invalid inputs", () => {
    it("doesn't accept projection to single", () => {
        expect(() =>
            _seq([1, 2, 3])
                // @ts-expect-error
                .toMap(() => [1])
                .pull()
        ).toThrow(Doddle)
    })

    it("doesn't accept projection to triple", () => {
        expect(() =>
            _seq([1, 2, 3])
                // @ts-expect-error
                .toMap(x => [x, x, x])
                .pull()
        ).toThrow(Doddle)
    })
})
