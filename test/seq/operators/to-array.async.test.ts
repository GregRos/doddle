import type { DoddleAsync } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _aseq = aseq

declare.it("is typed correctly", expect => {
    const s = _aseq([1, 2, 3]).toArray()
    expect(type_of(s)).to_equal(type<DoddleAsync<number[]>>)
})

declare.it("is typed correctly for mixed types", expect => {
    const s = _aseq([1, "two", true]).toArray()
    expect(type_of(s)).to_equal(type<DoddleAsync<(string | number | boolean)[]>>)
})
it("converts an empty sequence to an empty array", async () => {
    const s = _aseq([])
    expect(await s.toArray().pull()).toEqual([])
})

it("converts a non-empty sequence to an array", async () => {
    const s = _aseq([1, 2, 3])
    expect(await s.toArray().pull()).toEqual([1, 2, 3])
})

it("handles sequences with different types", async () => {
    const s = _aseq([1, "two", true])
    expect(await s.toArray().pull()).toEqual([1, "two", true])
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(function* () {})
    const s = _aseq(fn)
    const doddle = s.toArray()
    expect(fn).not.toHaveBeenCalled()
    await doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("produces array twice", async () => {
    const fn = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
    })
    const s = _aseq(fn)
    expect(await s.toArray().pull()).toEqual([1, 2, 3])
    expect(await s.toArray().pull()).toEqual([1, 2, 3])
    expect(fn).toHaveBeenCalledTimes(2)
})
