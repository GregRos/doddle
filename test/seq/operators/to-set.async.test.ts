import { aseq, DoddleAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq

declare.it("is typed correctly", expect => {
    const s = _seq([1, 2, 3]).toSet()
    expect(type_of(s)).to_equal(type<DoddleAsync<Set<number>>>)
})

declare.it("is typed correctly for mixed types", expect => {
    const s = _seq([1, "two", true]).toSet()
    expect(type_of(s)).to_equal(type<DoddleAsync<Set<string | number | boolean>>>)
})

declare.it("allows doddle iteratee", expect => {
    const s = _seq([1, 2, 3]).toSet()
    expect(type_of(s)).to_equal(type<DoddleAsync<Set<number>>>)
})

declare.it("allows doddle async iteratee", expect => {
    const s = _seq([1, 2, 3]).toSet()
    expect(type_of(s)).to_equal(type<DoddleAsync<Set<number>>>)
})

declare.it("allows async doddle async iteratee", expect => {
    const s = _seq([1, 2, 3]).toSet()
    expect(type_of(s)).to_equal(type<DoddleAsync<Set<number>>>)
})

it("converts an empty sequence to an empty set", async () => {
    const s = _seq([])
    expect(await s.toSet().pull()).toEqual(new Set())
})

it("converts a non-empty sequence to a set", async () => {
    const s = _seq([1, 2, 3])
    expect(await s.toSet().pull()).toEqual(new Set([1, 2, 3]))
})

it("handles sequences with different types", async () => {
    const s = _seq([1, "two", true])
    expect(await s.toSet().pull()).toEqual(new Set([1, "two", true]))
})

it("handles sequences with duplicate values", async () => {
    const s = _seq([1, 2, 1, 2])
    expect(await s.toSet().pull()).toEqual(new Set([1, 2]))
})

it("produces set twice", async () => {
    const fn = jest.fn(async function* () {
        yield 1
        yield 2
        yield 3
    })
    const s = _seq(fn)
    expect(await s.toSet().pull()).toEqual(new Set([1, 2, 3]))
    expect(await s.toSet().pull()).toEqual(new Set([1, 2, 3]))
    expect(fn).toHaveBeenCalledTimes(2)
})
