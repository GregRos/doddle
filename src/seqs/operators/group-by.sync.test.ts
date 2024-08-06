import { declare, type, type_of } from "declare-it"

import type { Lazy } from "../../index.js"
import { seq } from "../../index.js"
const _seq = seq
declare.it("returns Lazy<Map<K, [T, ...T[]]>>", expect => {
    const s = _seq([1, 2, 3]).groupBy(() => 1)
    expect(type_of(s)).to_equal(type<Lazy<Map<number, [number, ...number[]]>>>)
})

declare.it("iteratee has single argument", expect => {
    _seq([1, 2, 3]).groupBy((...args) => {
        expect(type_of(args)).to_equal(type<[number]>)
    })
})

declare.it("iteratee can't have two arguments", expect => {
    // @ts-expect-error
    _seq([1, 2, 3]).groupBy((_, __) => 1)
})

it("returns empty map on empty", () => {
    const s = _seq([]).groupBy(() => 1)
    expect(s.pull()).toEqual(new Map())
})

it("returns map with singleton on singleton", () => {
    const s = _seq([1]).groupBy(() => 1)
    expect(s.pull()).toEqual(new Map([[1, [1]]]))
})

it("groups all by single key, preserves order", () => {
    const s = _seq([1, 2, 1, 2]).groupBy(_ => 1)
    expect(s.pull()).toEqual(new Map([[1, [1, 2, 1, 2]]]))
})

it("groups into two keys, preserves order", () => {
    const s = _seq([1, 2, 3, 4]).groupBy(x => x % 2)
    expect(s.pull()).toEqual(
        new Map([
            [1, [1, 3]],
            [0, [2, 4]]
        ])
    )
})

it("groups by object by reference", () => {
    const obj1 = {}
    const obj2 = {}
    const s = _seq([1, 2, 3]).groupBy(x => (x % 2 ? obj1 : obj2))
    expect(s.pull()).toEqual(
        new Map([
            [obj1, [1, 3]],
            [obj2, [2]]
        ])
    )
})

it("does not pass index", () => {
    const iteratee = jest.fn(x => x)
    _seq([1, 2, 3]).groupBy(iteratee).pull()
    expect(iteratee).toHaveBeenNthCalledWith(1, 1)
    expect(iteratee).toHaveBeenNthCalledWith(2, 2)
    expect(iteratee).toHaveBeenNthCalledWith(3, 3)
})

it("pulls each item once", () => {
    const iteratee = jest.fn(x => x)
    _seq([1, 2, 3]).groupBy(iteratee).pull()
    expect(iteratee).toHaveBeenCalledTimes(3)
})

it("no side-effects before pull", () => {
    const fn = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
    })
    const input = _seq(fn)
    const map = jest.fn(x => x)
    const result = input.groupBy(map)
    expect(fn).not.toHaveBeenCalled()
    expect(map).not.toHaveBeenCalled()
    result.pull()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(map).toHaveBeenCalledTimes(3)
})
