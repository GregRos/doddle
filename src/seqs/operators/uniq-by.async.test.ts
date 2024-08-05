import { declare, type, type_of } from "declare-it"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
const _aseq = seq
type _ASeq<T> = Seq<T>
declare.it("should type as Lazy<T>", expect => {
    expect(type_of(_aseq([1, 2, 3]).uniqBy(() => 1))).to_equal(type<_ASeq<number>>)
})
declare.it("should not accept iteratee with 2 arguments", expect => {
    // @ts-expect-error
    _aseq([1, 2, 3]).uniqBy((x, i) => x)
})

it("returns empty on empty", async () => {
    const s = _aseq([]).uniqBy(() => 1)
    expect(await s._qr).toEqual([])
})

it("returns singleton on singleton", async () => {
    const s = _aseq([1]).uniqBy(() => 1)
    expect(await s._qr).toEqual([1])
})

it("removes duplicates", async () => {
    const s = _aseq([1, 2, 1, 2]).uniqBy(() => 1)
    expect(await s._qr).toEqual([1])
})

it("removes duplicates with weird elements, also maintains order", async () => {
    const s = _aseq([1, NaN, -0, undefined, undefined, 0, null, 1, undefined]).uniqBy(x => x)
    expect(await s._qr).toEqual([1, NaN, -0, undefined, null])
})

it("does not provide index", async () => {
    const map = jest.fn((x, i) => {
        expect(i).toBeUndefined()
        return x
    }) as any
    const s = _aseq([1, 2, 3]).uniqBy(map)
    for await (const _ of s) {
    }
})

it("no side-effects before pull", async () => {
    const fn = jest.fn(function* () {
        yield 1
    })
    const input = _aseq(fn)
    const result = input.uniqBy(() => 1)
    expect(fn).not.toHaveBeenCalled()
    for await (const _ of result) {
    }
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls, calls iteratee as many as needed", async () => {
    const sq = jest.fn(function* () {
        yield 1
        yield 1
        yield 2
        yield 3
        yield 3
        yield 3
    })
    const map = jest.fn(x => x)
    const tkw = _aseq(sq).uniqBy(map)
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
