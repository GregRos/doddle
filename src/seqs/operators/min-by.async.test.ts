import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "../.."
import type { ASeq } from "../.."
import { aseq } from "../.."

const _aseq = aseq
type _ASeq<T> = ASeq<T>

declare.test("should type as LazyAsync<T | undefined>", expect => {
    expect(type_of(_aseq([1, 2, 3]).minBy(() => true))).to_equal(
        type<LazyAsync<number | undefined>>
    )
})

declare.test("should type as LazyAsync<T | string> with alt", expect => {
    expect(type_of(_aseq([1, 2, 3]).minBy(() => true, "alt" as string))).to_equal(
        type<LazyAsync<number | string>>
    )
})

declare.test("should type as LazyAsync<T | 'alt'> with alt", expect => {
    expect(type_of(_aseq([1, 2, 3]).minBy(() => true, "alt"))).to_equal(
        type<LazyAsync<number | "alt">>
    )
})

it("returns undefined for empty", async () => {
    const s = _aseq([]).minBy(() => true)
    expect(await s.pull()).toEqual(undefined)
})

it("sorted input", async () => {
    const s = _aseq([1, 2, 3]).minBy(x => x)
    expect(await s.pull()).toEqual(1)
})

it("unsorted input", async () => {
    const s = _aseq([3, 1, 2]).minBy(x => x)
    expect(await s.pull()).toEqual(1)
})

it("returns first value for same input", async () => {
    const s = _aseq([1, 2, 3]).minBy(() => true)
    expect(await s.pull()).toEqual(1)
})

it("returns alt for empty sequence", async () => {
    const s = _aseq([]).minBy(() => false, "alt")
    expect(await s.pull()).toEqual("alt")
})

it("returns undefined if no alt", async () => {
    const s = _aseq([]).minBy(() => false)
    expect(await s.pull()).toEqual(undefined)
})

it("no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {
        yield 1
    })
    const s = _aseq(fn)
    const lazy = s.minBy(() => true)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("calls iteratee as many times as needed", async () => {
    const fn = jest.fn(x => x)
    const s = _aseq([1, 2, 3]).minBy(fn)
    expect(fn).not.toHaveBeenCalled()
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("no calls for empty sequence", async () => {
    const fn = jest.fn(x => x)
    const s = _aseq([]).minBy(fn)
    expect(fn).not.toHaveBeenCalled()
    await s.pull()
    expect(fn).not.toHaveBeenCalled()
})

it("returns first min value", async () => {
    const s = _aseq([3, 1, 3, 1]).minBy(x => x)
    expect(await s.pull()).toEqual(1)
})

it("doesn't error for non-comparable keys", async () => {
    const s = _aseq([1, 2, 3]).minBy(x => ({}))
    await expect(s.pull()).resolves.not.toThrow()
})

it("iteratee receives index", async () => {
    const fn = jest.fn((x, i) => {
        expect(i).toBe(x - 1)
        return x
    })
    const s = _aseq([1, 2, 3]).minBy(fn)
    expect(await s.pull()).toEqual(1)
})

it("works with async iteratee", async () => {
    const s = _aseq([3, 1, 2]).minBy(async x => x)
    expect(await s.pull()).toEqual(1)
})
