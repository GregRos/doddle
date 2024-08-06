import { declare, type, type_of } from "declare-it"
import { aseq, type ASeq } from "../../index.js"

const _seq = aseq
type _Seq<T> = ASeq<T>
describe("type tests", () => {
    declare.it("keeps same type as input when no ellipsis is given", expect => {
        expect(type_of(_seq([1]).takeWhile(() => true))).to_equal(type<_Seq<number>>)
    })
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
    }
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", async () => {
    const f = jest.fn(x => x < 2)
    const s = _seq([1, 2, 3, 4, 5]).takeWhile(f)
    for await (const _ of s) {
    }
    expect(f).toHaveBeenCalledTimes(2)
})

it("works with async predicate", async () => {
    const s = _seq([1, 2, 3]).takeWhile(async () => true)
    await expect(s._qr).resolves.toEqual([1, 2, 3])
})
