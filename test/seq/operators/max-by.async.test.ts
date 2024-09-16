import type { DoddleAsync } from "@lib"
import { aseq, doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

const _aseq = aseq

declare.test("should type as LazyAsync<T | undefined>", expect => {
    expect(type_of(_aseq([1, 2, 3]).maxBy(() => true))).to_equal(
        type<DoddleAsync<number | undefined>>
    )
})

declare.test("should type as LazyAsync<T | string> with alt", expect => {
    expect(type_of(_aseq([1, 2, 3]).maxBy(() => true, "alt" as string))).to_equal(
        type<DoddleAsync<number | string>>
    )
})

declare.test("should type as LazyAsync<T | 'alt'> with alt", expect => {
    expect(type_of(_aseq([1, 2, 3]).maxBy(() => true, "alt"))).to_equal(
        type<DoddleAsync<number | "alt">>
    )
})

declare.test("allows lazy iteratee", expect => {
    const s = _aseq([1, 2, 3]).maxBy(() => doddle(() => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<number | undefined>>)
})

declare.test("allows lazy async iteratee", expect => {
    const s = _aseq([1, 2, 3]).maxBy(() => doddle(async () => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<number | undefined>>)
})

declare.test("allows async lazy async iteratee", expect => {
    const s = _aseq([1, 2, 3]).maxBy(async () => doddle(async () => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<number | undefined>>)
})

it("returns undefined for empty", async () => {
    const s = _aseq([]).maxBy(() => true)
    expect(await s.pull()).toEqual(undefined)
})

it("sorted input", async () => {
    const s = _aseq([1, 2, 3]).maxBy(x => x)
    expect(await s.pull()).toEqual(3)
})

it("unsorted input", async () => {
    const s = _aseq([3, 1, 2]).maxBy(x => x)
    expect(await s.pull()).toEqual(3)
})

it("returns first value for same input", async () => {
    const s = _aseq([1, 2, 3]).maxBy(() => true)
    expect(await s.pull()).toEqual(1)
})

it("returns alt for empty sequence", async () => {
    const s = _aseq([]).maxBy(() => false, "alt")
    expect(await s.pull()).toEqual("alt")
})

it("returns undefined if no alt", async () => {
    const s = _aseq([]).maxBy(() => false)
    expect(await s.pull()).toEqual(undefined)
})

it("no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {
        yield 1
    })
    const s = _aseq(fn)
    const lazy = s.maxBy(() => true)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("calls iteratee as many times as needed", async () => {
    const fn = jest.fn(x => x)
    const s = _aseq([1, 2, 3]).maxBy(fn)
    expect(fn).not.toHaveBeenCalled()
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("no calls for empty sequence", async () => {
    const fn = jest.fn(x => x)
    const s = _aseq([]).maxBy(fn)
    expect(fn).not.toHaveBeenCalled()
    await s.pull()
    expect(fn).not.toHaveBeenCalled()
})

it("returns first max value", async () => {
    const s = _aseq([1, 2, 3, 2]).maxBy(x => x)
    expect(await s.pull()).toEqual(3)
})

it("doesn't error for non-comparable keys", async () => {
    const s = _aseq([1, 2, 3]).maxBy(_ => ({}))
    await expect(s.pull()).resolves.not.toThrow()
})

it("iteratee receives index", async () => {
    const fn = jest.fn((x, i) => {
        expect(i).toBe(x - 1)
        return x
    })
    const s = _aseq([1, 2, 3]).maxBy(fn)
    expect(await s.pull()).toEqual(3)
})

it("works with async iteratee", async () => {
    const s = _aseq([1, 3, 2]).maxBy(async x => x)
    expect(await s.pull()).toEqual(3)
})

it("works for lazy iteratee", async () => {
    const s = _aseq([1, 3, 2]).maxBy(i => doddle(() => i))
    expect(await s.pull()).toEqual(3)
})

it("works for lazy async iteratee", async () => {
    const s = _aseq([1, 3, 2]).maxBy(i => doddle(async () => i))
    expect(await s.pull()).toEqual(3)
})

it("works for async lazy iteratee", async () => {
    const s = _aseq([1, 3, 2]).maxBy(async i => doddle(() => i))
    expect(await s.pull()).toEqual(3)
})

it("works for async lazy async iteratee", async () => {
    const s = _aseq([1, 3, 2]).maxBy(async i => doddle(async () => i))
    expect(await s.pull()).toEqual(3)
})
