import { declare, type, type_of } from "declare-it"
import { LazyAsync } from "../../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

const _seq = aseq
type _Seq<T> = ASeq<T>

declare.it("is typed correctly", expect => {
    const s = _seq([1, 2, 3]).toSet()
    expect(type_of(s)).to_equal(type<LazyAsync<Set<number>>>)
})

declare.it("is typed correctly for mixed types", expect => {
    const s = _seq([1, "two", true]).toSet()
    expect(type_of(s)).to_equal(type<LazyAsync<Set<string | number | boolean>>>)
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
