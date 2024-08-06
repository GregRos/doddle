import { declare, type, type_of } from "declare-it"

import type { Seq } from "../../index.js"
import { seq } from "../../index.js"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("element type is Acc", expect => {
    const s = _seq(null! as string).scan(() => 1, 0)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})
declare.it("can be called with no initial value but the type is T", expect => {
    const s = _seq([""])
    expect(type_of(s.scan(() => "a"))).to_equal(type<_Seq<string>>)
    // @ts-expect-error does not allow a different type
    s.scan(() => 1)
})

it("scans with initial value on empty, giving singleton", () => {
    const s = _seq([]).scan(() => 1, 0)
    expect(s._qr).toEqual([0])
})

it("scans without initial value on empty, giving empty", () => {
    const s = _seq<number>([]).scan(() => 1)
    expect(s._qr).toEqual([])
})

it("scans with initial value, starting with initial", () => {
    const s = _seq([1, 2, 3]).scan((acc, x) => acc + x, 1)
    expect(s._qr).toEqual([1, 2, 4, 7])
})

it("scans without initial value, starting with first element", () => {
    const s = _seq([1, 2, 3]).scan((acc, x) => acc + x)
    expect(s._qr).toEqual([1, 3, 6])
})

it("scans with initial value, if stopped at first element, reducer is not called", () => {
    const fn = jest.fn((acc, x) => acc + x)
    const s = _seq([1, 2, 3]).scan(fn, 1)
    expect(fn).not.toHaveBeenCalled()
    for (const x of s) {
        if (x === 1) {
            break
        }
    }
    expect(fn).not.toHaveBeenCalled()
})

it("scans without initial value, if stopped at first element, reducer is not called", () => {
    const fn = jest.fn((acc, x) => acc + x)
    const s = _seq([1, 2, 3]).scan(fn)
    expect(fn).not.toHaveBeenCalled()
    for (const x of s) {
        if (x === 1) {
            break
        }
    }
    expect(fn).not.toHaveBeenCalled()
})

it("works on infinite sequence", () => {
    const s = _seq.repeat(Infinity, 1).scan((acc, x) => acc + x, 0)
    for (const _ of s) {
        break
    }
})

it("calls reducer L - 1 times, without initial value", () => {
    const f = jest.fn((acc, x) => acc + x)
    const s = _seq([1, 2, 3]).scan(f)
    expect(f).not.toHaveBeenCalled()
    for (const _ of s) {
    }

    expect(f).toHaveBeenCalledTimes(2)
})

it("calls reducer L times, with initial value", () => {
    const f = jest.fn((acc, x) => acc + x)
    const s = _seq([1, 2, 3]).scan(f, 0)
    expect(f).not.toHaveBeenCalled()
    for (const _ of s) {
    }

    expect(f).toHaveBeenCalledTimes(3)
})

it("can iterate twice", () => {
    const s = _seq([1, 2, 3]).scan((acc, x) => acc + x, 0)
    expect(s._qr).toEqual([0, 1, 3, 6])
    expect(s._qr).toEqual([0, 1, 3, 6])
})

it("can iterate twice without initial value", () => {
    const s = _seq([1, 2, 3]).scan((acc, x) => acc + x)
    expect(s._qr).toEqual([1, 3, 6])
    expect(s._qr).toEqual([1, 3, 6])
})

it("accepts index as third argument", () => {
    const s = _seq([1, 2, 3]).scan((acc, x, i) => acc + i, 0)
    expect(s._qr).toEqual([0, 0, 1, 3])
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {
        yield 1
    })
    const s = _seq(fn)
    const lazy = s.scan(() => 1)
    expect(fn).not.toHaveBeenCalled()
    for (const _ of lazy) {
    }
    expect(fn).toHaveBeenCalledTimes(1)
})
