import { declare, type, type_of } from "declare-it"
import { aseq } from "../.."

import type { LazyAsync } from "../.."
const _aseq = aseq

declare.it("returns LazyAsync<Map<K, [T, ...T[]]>>", expect => {
    const s = _aseq([1, 2, 3]).groupBy(() => 1)
    expect(type_of(s)).to_equal(type<LazyAsync<Map<number, [number, ...number[]]>>>)
})

declare.it("iteratee has single argument", expect => {
    _aseq([1, 2, 3]).groupBy((...args) => {
        expect(type_of(args)).to_equal(type<[number]>)
    })
})

declare.it("iteratee can't have two arguments", expect => {
    // @ts-expect-error
    _aseq([1, 2, 3]).groupBy((_, __) => 1)
})

it("returns empty map on empty", async () => {
    const s = _aseq([]).groupBy(() => 1)
    expect(await s.pull()).toEqual(new Map())
})

it("returns map with singleton on singleton", async () => {
    const s = _aseq([1]).groupBy(() => 1)
    expect(await s.pull()).toEqual(new Map([[1, [1]]]))
})

it("groups all by single key, preserves order", async () => {
    const s = _aseq([1, 2, 1, 2]).groupBy(_ => 1)
    expect(await s.pull()).toEqual(new Map([[1, [1, 2, 1, 2]]]))
})

it("groups into two keys, preserves order", async () => {
    const s = _aseq([1, 2, 3, 4]).groupBy(x => x % 2)
    expect(await s.pull()).toEqual(
        new Map([
            [1, [1, 3]],
            [0, [2, 4]]
        ])
    )
})

it("works with async iteratee", async () => {
    const s = _aseq([1, 2, 3, 4]).groupBy(async x => x % 2)
    expect(await s.pull()).toEqual(
        new Map([
            [1, [1, 3]],
            [0, [2, 4]]
        ])
    )
})

it("groups by object by reference", async () => {
    const obj1 = {}
    const obj2 = {}
    const s = _aseq([1, 2, 3]).groupBy(x => (x % 2 ? obj1 : obj2))
    expect(await s.pull()).toEqual(
        new Map([
            [obj1, [1, 3]],
            [obj2, [2]]
        ])
    )
})

it("does not pass index", async () => {
    const iteratee = jest.fn(x => x)
    await _aseq([1, 2, 3]).groupBy(iteratee).pull()
    expect(iteratee).toHaveBeenNthCalledWith(1, 1)
    expect(iteratee).toHaveBeenNthCalledWith(2, 2)
    expect(iteratee).toHaveBeenNthCalledWith(3, 3)
})

it("pulls each item once", async () => {
    const iteratee = jest.fn(x => x)
    await _aseq([1, 2, 3]).groupBy(iteratee).pull()
    expect(iteratee).toHaveBeenCalledTimes(3)
})

it("no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {
        yield 1
        yield 2
        yield 3
    })
    const input = _aseq(fn)
    const map = jest.fn(x => x)
    const result = input.groupBy(map)
    expect(fn).not.toHaveBeenCalled()
    expect(map).not.toHaveBeenCalled()
    await result.pull()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(map).toHaveBeenCalledTimes(3)
})
