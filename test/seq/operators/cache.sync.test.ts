import type { Seq } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
import { _iter } from "@utils"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("should type as _Seq<T>", expect => {
    expect(type_of(_seq([1, 2, 3]).cache())).to_equal(type<_Seq<number>>)
})

it("returns empty for empty", () => {
    const s = _seq([]).cache()
    expect(s._qr).toEqual([])
})

it("returns same for same", () => {
    const s = _seq([1, 2, 3]).cache()
    expect(s._qr).toEqual([1, 2, 3])
})

it("can iterate twice", () => {
    const s = _seq([1, 2, 3]).cache()
    expect(s._qr).toEqual([1, 2, 3])
    expect(s._qr).toEqual([1, 2, 3])
})

it("no side-effects until pulled", () => {
    const sq = jest.fn(function* () {
        yield 1
    })
    const map = jest.fn(x => x)
    const s = seq(sq).map(map)
    const c = s.cache()
    expect(sq).not.toHaveBeenCalled()
    expect(map).not.toHaveBeenCalled()
    for (const _ of c) {
    }
    expect(sq).toHaveBeenCalledTimes(1)
    expect(map).toHaveBeenCalledTimes(1)
})

it("side-effects only once", () => {
    const sq = jest.fn(function* () {
        yield 1
    })
    const map = jest.fn(x => x)
    const s = seq(sq).map(map)
    const c = s.cache()
    expect(map).not.toHaveBeenCalled()
    for (const _ of c) {
    }
    for (const _ of c) {
    }
    expect(map).toHaveBeenCalledTimes(1)
})

it("can iterate different lengths", () => {
    const each = jest.fn()
    const s = _seq([1, 2, 3, 4]).each(each).cache()
    const first3 = s.take(3)
    expect(first3._qr).toEqual([1, 2, 3])
    expect(each).toHaveBeenCalledTimes(3)
    const first2 = s.take(2)
    expect(first2._qr).toEqual([1, 2])
    expect(each).toHaveBeenCalledTimes(3)
    const all = s
    expect(all._qr).toEqual([1, 2, 3, 4])
    expect(each).toHaveBeenCalledTimes(4)
})

it("can handle multiple concurrent iterators", () => {
    const s = _seq([1, 2, 3, 4]).cache()
    const iter1 = _iter(s)
    const iter2 = _iter(s)
    expect(iter1.next()).toEqual({ value: 1, done: false })
    expect(iter2.next()).toEqual({ value: 1, done: false })
    expect(iter1.next()).toEqual({ value: 2, done: false })
    expect(iter1.next()).toEqual({ value: 3, done: false })
    expect(iter2.next()).toEqual({ value: 2, done: false })
    expect(iter2.next()).toEqual({ value: 3, done: false })
    expect(iter2.next()).toEqual({ value: 4, done: false })
    expect(iter2.next()).toEqual({ value: undefined, done: true })
    expect(iter1.next()).toEqual({ value: 4, done: false })
    expect(iter1.next()).toEqual({ value: undefined, done: true })
})

it("reproduces thrown error at the same index", () => {
    const handler = jest.fn((err, i) => {
        return [i]
    })
    const s = _seq([1, 2, 3, 4])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .cache()
    const endsWithErrorIndex = s.catch(handler)
    expect(endsWithErrorIndex.last().pull()).toEqual(2)
    expect(endsWithErrorIndex.last().pull()).toEqual(2)
    expect(handler).toHaveBeenCalledTimes(2)

    expect(endsWithErrorIndex._qr).toEqual([1, 2, 2])
})
