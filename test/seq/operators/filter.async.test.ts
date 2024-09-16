import type { ASeq } from "@lib"
import { aseq, doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq
type _Seq<T> = ASeq<T>
declare.it("element stays the same type with no type predicate", expect => {
    const s = _seq([1, 2, 3]).filter(() => true)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("element type changes with type predicate which is a subtype", expect => {
    const s = _seq([1, 2, 3]).filter(x => x === 2)
    expect(type_of(s)).to_equal(type<_Seq<2>>)
})

declare.it("element type doesn't change if the predicate is for a supertype", expect => {
    const s = _seq([1, 1] as 1[]).filter(x => typeof x === "number")
    expect(type_of(s)).to_equal(type<_Seq<1>>)
})

declare.it("allows doddle predicate", expect => {
    const s = _seq([1, 2, 3]).filter(() => doddle(() => true))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("allows doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).filter(() => doddle(async () => true))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("allows async doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).filter(async () => doddle(async () => true))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

it("filters out elements", async () => {
    const s = _seq([1, 2, 3]).filter(x => x > 1)
    expect(await s._qr).toEqual([2, 3])
})

it("filters out elements with index", async () => {
    const s = _seq([1, 2, 3]).filter((x, i) => i > 1)
    expect(await s._qr).toEqual([3])
})

it("filters out all elements", async () => {
    const s = _seq([1, 2, 3]).filter(() => false)
    expect(await s._qr).toEqual([])
})

it("filters out no elements", async () => {
    const s = _seq([1, 2, 3]).filter(() => true)
    expect(await s._qr).toEqual([1, 2, 3])
})

it("has no side-effects, pulls as many as needed", async () => {
    const fn = jest.fn(x => x > 1)
    const s = _seq([1, 2, 3]).filter(fn)
    expect(fn).not.toHaveBeenCalled()
    await s._qr
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls predicate as many times as needed", async () => {
    const fn = jest.fn(x => x > 1)
    const s = _seq([1, 2, 3]).filter(fn)
    await s._qr
    expect(fn).toHaveBeenCalledTimes(3)
})

it("can iterate twice", async () => {
    const s = _seq([1, 2, 3]).filter(x => x > 1)
    expect(await s._qr).toEqual([2, 3])
    expect(await s._qr).toEqual([2, 3])
})

it("works for async predicates (true)", async () => {
    const s = _seq([1, 2, 3]).filter(async x => x === 2)
    expect(await s._qr).toEqual([2])
})

it("works for async predicates (false)", async () => {
    const s = _seq([1, 2, 3]).filter(async x => x === 4)
    expect(await s._qr).toEqual([])
})

it("allows doddle predicate", async () => {
    const s = _seq([1, 2, 3]).filter(i => doddle(() => i % 2 === 0))
    expect(await s._qr).toEqual([2])
})

it("allows doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).filter(i => doddle(async () => i % 2 === 0))
    expect(await s._qr).toEqual([2])
})

it("allows async doddle predicate", async () => {
    const s = _seq([1, 2, 3]).filter(async i => doddle(() => i % 2 === 0))
    expect(await s._qr).toEqual([2])
})

it("allows async doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).filter(async i => doddle(async () => i % 2 === 0))
    expect(await s._qr).toEqual([2])
})
