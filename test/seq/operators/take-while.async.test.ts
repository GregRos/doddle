import { aseq, doddle, type ASeq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq
type _Seq<T> = ASeq<T>
declare.it("keeps same type as input", expect => {
    const s = _seq([1, 2, 3]).takeWhile(() => true)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("allows doddle predicate", expect => {
    const s = _seq([1, 2, 3]).takeWhile(() => doddle(() => true))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("allows doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).takeWhile(() => doddle(async () => true))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("allows async doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).takeWhile(async () => doddle(async () => true))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

it("immediate false gives empty", async () => {
    const s = _seq([1, 2, 3]).takeWhile(() => false)
    await expect(s._qr).resolves.toEqual([])
})

it("constant true gives same", async () => {
    const s = _seq([1, 2, 3]).takeWhile(() => true)
    await expect(s._qr).resolves.toEqual([1, 2, 3])
})

it("stops at first false", async () => {
    const s = _seq([1, 2, 3, 4, 5]).takeWhile(x => x < 3)
    await expect(s._qr).resolves.toEqual([1, 2])
})

it("stops at first false with index", async () => {
    const s = _seq([1, 2, 3, 4, 5]).takeWhile((x, i) => i < 3)
    await expect(s._qr).resolves.toEqual([1, 2, 3])
})

it("has no side-effects, pulls as many as needed", async () => {
    const sq = jest.fn(function* () {
        yield 1
        yield 2
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).takeWhile(x => x < 2)
    expect(sq).not.toHaveBeenCalled()
    for await (const _ of tkw) {
        // drain
    }
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", async () => {
    const f = jest.fn(x => x < 2)
    const s = _seq([1, 2, 3, 4, 5]).takeWhile(f)
    for await (const _ of s) {
        // drain
    }
    expect(f).toHaveBeenCalledTimes(2)
})

it("works with async predicate", async () => {
    const s = _seq([1, 2, 3]).takeWhile(async () => true)
    await expect(s._qr).resolves.toEqual([1, 2, 3])
})

it("works for doddle predicate", async () => {
    const s = _seq([1, 2, 3]).takeWhile(i => doddle(() => i < 3))
    await expect(s._qr).resolves.toEqual([1, 2])
})

it("works for doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).takeWhile(i => doddle(async () => i < 3))
    await expect(s._qr).resolves.toEqual([1, 2])
})

it("works for async doddle predicate", async () => {
    const s = _seq([1, 2, 3]).takeWhile(async i => doddle(() => i < 3))
    await expect(s._qr).resolves.toEqual([1, 2])
})

it("works for async doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).takeWhile(async i => doddle(async () => i < 3))
    await expect(s._qr).resolves.toEqual([1, 2])
})
