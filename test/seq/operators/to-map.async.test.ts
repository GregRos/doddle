import type { DoddleAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

import { DoddleError } from "@error"
import { aseq, doddle } from "@lib"

const _aseq = aseq

declare.it("accepts projection to pair", expect => {
    const s = _aseq([1, 2, 3]).toMap(x => [x, x])
    expect(type_of(s)).to_equal(type<DoddleAsync<Map<number, number>>>)
})

declare.it("allows projection to readonly pair", expect => {
    const s = _aseq([1, 2, 3]).toMap(x => [x, x] as readonly [number, number])
    expect(type_of(s)).to_equal(type<DoddleAsync<Map<number, number>>>)
})

declare.it("accepts projection to pair with different types", expect => {
    const s = _aseq([1, 2, 3]).toMap(x => [x, x.toString()])
    expect(type_of(s)).to_equal(type<DoddleAsync<Map<number, string>>>)
})

declare.it("doesn't accept projection to other", () => {
    // This would be a compile-time TypeScript error, not runtime
    // @ts-expect-error
    _aseq([1, 2, 3]).toMap(x => x)
})

declare.it("doesn't accept projection to triple", () => {
    // @ts-expect-error
    _aseq([1, 2, 3]).toMap(x => [x, x, x])
})

declare.it("doesn't accept projection to single", () => {
    // @ts-expect-error
    _aseq([1, 2, 3]).toMap(() => [1])
})

declare.it("doesn't accept projection to optional pair", () => {
    // @ts-expect-error
    _aseq([1, 2, 3]).toMap(x => [x, x] as [number, number?])
})

declare.it("doesn't accept projection to union with undefined", () => {
    // @ts-expect-error
    _aseq([1, 2, 3]).toMap(x => [x, x] as [number, number] | undefined)
})

declare.it("allows doddle projection", expect => {
    const s = _aseq([1, 2, 3]).toMap(() => doddle(() => [1, 1] as const))
    expect(type_of(s)).to_equal(type<DoddleAsync<Map<1, 1>>>)
})

declare.it("allows doddle async projection", expect => {
    const s = _aseq([1, 2, 3]).toMap(() => doddle(async () => [1, 1] as const))
    expect(type_of(s)).to_equal(type<DoddleAsync<Map<1, 1>>>)
})

declare.it("allows async doddle async projection", expect => {
    const s = _aseq([1, 2, 3]).toMap(async () => doddle(async () => [1, 1] as const))
    expect(type_of(s)).to_equal(type<DoddleAsync<Map<1, 1>>>)
})

it("converts empty to empty", async () => {
    const s = _aseq([]).toMap(x => [x, x])
    expect(await s.pull()).toEqual(new Map())
})

it("doesn't call projection on empty", async () => {
    const fn = jest.fn()
    _aseq([]).toMap(fn)
    expect(fn).not.toHaveBeenCalled()
})

it("converts to map with mixed types", async () => {
    const s = _aseq([1, "two", true]).toMap(x => [x, x])
    expect(await s.pull()).toEqual(
        new Map([
            [1, 1],
            ["two", "two"],
            [true, true]
        ] as any)
    )
})

it("handles sequences with duplicate values", async () => {
    const s = _aseq([1, 2, 1, 2]).toMap(x => [x, x])
    expect(await s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2]
        ])
    )
})

it("keeps last key-value pair when duplicates are encountered", async () => {
    const s = _aseq([1, 2, 1, 2]).toMap((x, i) => [x, x + i])
    const map = await s.pull()
    expect(map.get(1)).toBe(3) // Since last key '1' comes with 1+2
    expect(map.get(2)).toBe(5) // Since last key '2' comes with 2+3
})

it("produces map twice", async () => {
    const s = _aseq([1, 2, 3])
    const refMap = new Map([
        [1, 1],
        [2, 2],
        [3, 3]
    ])
    expect(await s.toMap(x => [x, x]).pull()).toEqual(refMap)
    expect(await s.toMap(x => [x, x]).pull()).toEqual(refMap)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _aseq(fn)
    const doddle = s.toMap(x => [x, x])
    expect(fn).not.toHaveBeenCalled()
    await doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("calls projection as many times as needed", async () => {
    const fn = jest.fn(x => [x, x] as const)
    const s = _aseq([1, 2, 3]).toMap(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls projection with index", async () => {
    const fn = jest.fn((x, i) => [x, i] as any)
    const s = _aseq([1, 2, 3]).toMap(fn)
    await s.pull()
    expect(fn).toHaveBeenNthCalledWith(1, 1, 0)
    expect(fn).toHaveBeenNthCalledWith(2, 2, 1)
    expect(fn).toHaveBeenNthCalledWith(3, 3, 2)
})

it("works for async projections", async () => {
    const s = _aseq([1, 2, 3]).toMap(async x => [x, x])
    expect(await s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

it("works for doddle projections", async () => {
    const s = _aseq([1, 2, 3]).toMap(x => doddle(() => [x, x] as const))
    expect(await s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

it("works for async doddle projections", async () => {
    const s = _aseq([1, 2, 3]).toMap(async x => doddle(() => [x, x] as const))
    expect(await s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

it("works for doddle async projections", async () => {
    const s = _aseq([1, 2, 3]).toMap(x => doddle(async () => [x, x] as const))
    expect(await s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

it("works for async doddle async projections", async () => {
    const s = _aseq([1, 2, 3]).toMap(async x => doddle(async () => [x, x] as const))
    expect(await s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

describe("invalid inputs", () => {
    it("doesn't accept projection to single", async () => {
        await expect(() =>
            _aseq([1, 2, 3])
                // @ts-expect-error

                .toMap(() => [1])
                .pull()
        ).rejects.toThrow(DoddleError)
    })

    it("doesn't accept projection to triple", async () => {
        await expect(() =>
            _aseq([1, 2, 3])
                // @ts-expect-error
                .toMap(x => [x, x, x])
                .pull()
        ).rejects.toThrow(DoddleError)
    })
})
