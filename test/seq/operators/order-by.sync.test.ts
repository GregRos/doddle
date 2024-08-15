import type { Seq } from "@lib"
import { declare, type, type_of } from "declare-it"

import { lazy, seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("returns seq of same type", expect => {
    const s = _seq([1, 2, 3]).orderBy(() => 1)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

it("returns empty on empty", () => {
    const s = _seq([]).orderBy(() => 1)
    expect(s._qr).toEqual([])
})

it("returns singleton on singleton", () => {
    const s = _seq([1]).orderBy(() => 1)
    expect(s._qr).toEqual([1])
})

it("doesn't change order for same key", () => {
    const s = _seq([1, 2, 1, 2]).orderBy(() => 1)
    expect(s._qr).toEqual([1, 2, 1, 2])
})

it("sorted input", () => {
    const s = _seq([1, 2, 3]).orderBy(x => x)
    expect(s._qr).toEqual([1, 2, 3])
})

it("reverse = true gives descending order", () => {
    const s = _seq([1, 2, 3]).orderBy(x => x, true)
    expect(s._qr).toEqual([3, 2, 1])
})

it("unsorted input", () => {
    const s = _seq([3, 1, 2]).orderBy(x => x)
    expect(s._qr).toEqual([1, 2, 3])
})

it("input with duplicates", () => {
    const s = _seq([1, 2, 1, 2]).orderBy(x => x)
    expect(s._qr).toEqual([1, 1, 2, 2])
})

it("no side-effects before pull", () => {
    const fn = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
    })
    const input = _seq(fn)
    const result = input.orderBy(x => x)
    expect(fn).not.toHaveBeenCalled()
    for (const _ of result) {
    }
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls, calls iteratee as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
    })
    const map = jest.fn(x => x)
    const tkw = _seq(sq).orderBy(map)
    expect(sq).not.toHaveBeenCalled()
    expect(map).not.toHaveBeenCalled()
    for (const _ of tkw) {
    }
    expect(map).toHaveBeenCalledTimes(3)
    expect(sq).toHaveBeenCalledTimes(1)
})

it("doesn't throw for incomparable key", () => {
    expect(() =>
        _seq([null, undefined, NaN, {}, []])
            .orderBy(x => x)
            .toArray()
            .pull()
    ).not.toThrow()
})

it("works with lazy key selector", () => {
    const s = _seq([2, 3, 1]).orderBy(x => lazy(() => x))
    expect(s._qr).toEqual([1, 2, 3])
})
