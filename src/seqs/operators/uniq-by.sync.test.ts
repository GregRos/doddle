import type { Seq } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("returns seq of same type", expect => {
    const s = _seq([1, 2, 3]).uniqBy(() => 1)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})
declare.it("should not accept iteratee with 2 arguments", () => {
    // @ts-expect-error
    _seq([1, 2, 3]).uniqBy((x, _) => x)
})
it("returns empty on empty", () => {
    const s = _seq([]).uniqBy(() => 1)
    expect(s._qr).toEqual([])
})

it("returns singleton on singleton", () => {
    const s = _seq([1]).uniqBy(() => 1)
    expect(s._qr).toEqual([1])
})

it("removes duplicates", () => {
    const s = _seq([1, 2, 1, 2]).uniqBy(() => 1)
    expect(s._qr).toEqual([1])
})

it("removes duplicates with weird elements, also maintains order", () => {
    const s = _seq([1, NaN, -0, undefined, undefined, 0, null, 1, undefined]).uniqBy(x => x)
    expect(s._qr).toEqual([1, NaN, -0, undefined, null])
})

it("no side-effects before pull", () => {
    const fn = jest.fn(function* () {
        yield 1
    })
    const input = _seq(fn)
    const result = input.uniqBy(() => 1)
    expect(fn).not.toHaveBeenCalled()
    for (const _ of result) {
    }
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls, calls iteratee as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        yield 1
        yield 2
        yield 3
        yield 3
        yield 3
    })
    const map = jest.fn(x => x)
    const tkw = _seq(sq).uniqBy(map)
    let i = 0
    expect(sq).not.toHaveBeenCalled()
    for (const _ of tkw) {
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
