import type { ASeq } from "@lib"
import { aseq, doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq
type _Seq<T> = ASeq<T>
declare.test("should type as Doddle<number>", expect => {
    expect(type_of(_seq([1, 2, 3]).skipWhile(() => true))).to_equal(type<_Seq<number>>)
    expect(type_of(_seq([1, 2, 3]).skipWhile(() => true))).to_equal(type<_Seq<number>>)
})
declare.test("allows doddle predicate", expect => {
    const s = _seq([1, 2, 3]).skipWhile(() => doddle(() => true))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})
declare.test("allows doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).skipWhile(() => doddle(async () => true))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})
declare.test("allows async doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).skipWhile(async () => doddle(async () => true))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})
it("returns empty for constant true", async () => {
    const s = _seq([1, 2, 3]).skipWhile(() => true)
    await expect(s._qr).resolves.toEqual([])
})

it("returns all for constant false", async () => {
    const s = _seq([1, 2, 3]).skipWhile(() => false)
    expect(await s._qr).toEqual([1, 2, 3])
})

it("returns all for no matches", async () => {
    const s = _seq([1, 2, 3]).skipWhile(() => false)
    expect(await s._qr).toEqual([1, 2, 3])
})

it("returns 2 for first false", async () => {
    const s = _seq([1, 2, 3, 4, 5]).skipWhile(x => x < 3)
    expect(await s._qr).toEqual([3, 4, 5])
})

it("returns 3 for first false with index", async () => {
    const s = _seq([1, 2, 3, 4, 5]).skipWhile((x, i) => i < 3)
    expect(await s._qr).toEqual([4, 5])
})

it("has no side-effects, pulls as many as needed", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        yield 2
        yield 3
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).skipWhile(x => x < 2)
    expect(sq).not.toHaveBeenCalled()
    for await (const x of tkw) {
        expect(x).toBe(2)
        break
    }
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", async () => {
    const f = jest.fn(x => x < 2)
    const s = _seq([1, 2, 3, 4, 5]).skipWhile(f)
    expect(f).not.toHaveBeenCalled()
    for await (const x of s) {
        expect(x).toBe(2)
        break
    }
    expect(f).toHaveBeenCalledTimes(2)
})

it("works with async predicate", async () => {
    const s = _seq([1, 2, 3]).skipWhile(async x => x < 2)
    expect(await s._qr).toEqual([2, 3])
})

it("allows doddle predicate", async () => {
    const s = _seq([1, 2, 3]).skipWhile(i => doddle(() => i < 2))
    expect(await s._qr).toEqual([2, 3])
})

it("allows doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).skipWhile(i => doddle(async () => i < 2))
    expect(await s._qr).toEqual([2, 3])
})

it("allows async doddle predicate", async () => {
    const s = _seq([1, 2, 3]).skipWhile(async i => doddle(() => i < 2))
    expect(await s._qr).toEqual([2, 3])
})

it("allows async doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).skipWhile(async i => doddle(async () => i < 2))
    expect(await s._qr).toEqual([2, 3])
})
