import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

const _seq = aseq
type _Seq<T> = ASeq<T>
declare.it("should type as Lazy<T>", expect => {
    expect(type_of(_seq([1, 2, 3]).uniq())).to_equal(type<_Seq<number>>)
})

it("returns empty on empty", async () => {
    const s = _seq([]).uniq()
    expect(await s._qr).toEqual([])
})

it("returns singleton on singleton", async () => {
    const s = _seq([1]).uniq()
    expect(await s._qr).toEqual([1])
})

it("removes duplicates", async () => {
    const s = _seq([1, 2, 1, 2]).uniq()
    expect(await s._qr).toEqual([1, 2])
})

it("removes duplicates with weird elements, also maintains order", async () => {
    const s = _seq([1, NaN, -0, undefined, undefined, 0, null, 1, undefined]).uniq()
    expect(await s._qr).toEqual([1, NaN, -0, undefined, null])
})

it("no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {
        yield 1
    })
    const input = _seq(fn)
    const result = input.uniq()
    expect(fn).not.toHaveBeenCalled()
    for await (const _ of result) {
    }
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        yield 1
        yield 2
        yield 3
        yield 3
        yield 3
    })
    const map = jest.fn(x => x)
    const tkw = _seq(sq).map(map).uniq()
    let i = 0
    expect(sq).not.toHaveBeenCalled()
    for await (const _ of tkw) {
        if (i === 0) {
            expect(map).toHaveBeenCalledTimes(1)
        } else if (i === 1) {
            expect(map).toHaveBeenCalledTimes(3)
        } else if (i === 2) {
            expect(map).toHaveBeenCalledTimes(4)
        }
        i++
    }
    expect(map).toHaveBeenCalledTimes(6)
    expect(sq).toHaveBeenCalledTimes(1)
})
