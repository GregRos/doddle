import type { Seq } from "@lib"
import { seq } from "@lib"
import { declare, type, type_of } from "declare-it"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("can't be called with less than two arguments", () => {
    // @ts-expect-error
    _seq.iterate(1)
    // @ts-expect-error
    _seq.iterate()
})

declare.it("can't be called with a non-function argument", () => {
    // @ts-expect-error
    _seq.iterate(2, 1)
})

declare.it("element type same as function return type", expect => {
    expect(type_of(_seq.iterate(3, () => 1))).to_equal(type<_Seq<number>>)
    expect(type_of(_seq.iterate(3, () => "a"))).to_equal(type<_Seq<string>>)
})

declare.it("function receives index", () => {
    _seq.iterate(3, (x: number) => x)
})

it("gives empty on count of 0", () => {
    expect(_seq.iterate(0, () => 1)._qr).toEqual([])
})

it("gives singleton on count of 1", () => {
    expect(_seq.iterate(1, () => 1)._qr).toEqual([1])
})

it("calls function repeatedly", () => {
    const fn = jest.fn(() => 1)
    expect(_seq.iterate(3, fn)._qr).toEqual([1, 1, 1])
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls function repeatedly with index", () => {
    const fn = jest.fn((x: number) => x)
    expect(_seq.iterate(3, fn)._qr).toEqual([0, 1, 2])
    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn).toHaveBeenNthCalledWith(1, 0)
    expect(fn).toHaveBeenNthCalledWith(2, 1)
    expect(fn).toHaveBeenNthCalledWith(3, 2)
})

it("can iterate twice, calling function repeatedly", () => {
    const fn = jest.fn(i => i)
    const s = _seq.iterate(3, fn)
    expect(s._qr).toEqual([0, 1, 2])
    expect(s._qr).toEqual([0, 1, 2])
    expect(fn).toHaveBeenCalledTimes(6)
})

it("pulls only as needed", () => {
    const fn = jest.fn(i => i)
    const s = _seq.iterate(3, fn)
    for (const x of s) {
        if (x === 1) break
    }
    expect(fn).toHaveBeenCalledTimes(2)
})

it("accepts Infinite count", () => {
    const fn = jest.fn(i => i)
    const s = _seq.iterate(Infinity, fn)
    expect(s.take(1000)._qr).toHaveLength(1000)
    expect(fn).toHaveBeenCalledTimes(1000)
})
