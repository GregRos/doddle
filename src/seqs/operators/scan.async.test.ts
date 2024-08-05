import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

const _seq = aseq
type _ASeq<T> = ASeq<T>

declare.it("element type is Acc", expect => {
    const s = _seq(null! as string).scan(() => 1, 0)
    expect(type_of(s)).to_equal(type<_ASeq<number>>)
})

declare.it("can be called with no initial value but the type is T", expect => {
    const s = _seq([""])
    expect(type_of(s.scan(() => "a"))).to_equal(type<_ASeq<string>>)
    // @ts-expect-error does not allow a different type
    s.scan(() => 1)
})

it("scans with initial value on empty, giving singleton", async () => {
    const s = _seq([]).scan(() => 1, 0)
    expect(await s._qr).toEqual([0])
})

it("scans without initial value on empty, giving empty", async () => {
    const s = _seq<number>([]).scan(() => 1)
    expect(await s._qr).toEqual([])
})

it("scans with initial value, starting with initial", async () => {
    const s = _seq([1, 2, 3]).scan((acc, x) => acc + x, 1)
    expect(await s._qr).toEqual([1, 2, 4, 7])
})

it("scans without initial value, starting with first element", async () => {
    const s = _seq([1, 2, 3]).scan((acc, x) => acc + x)
    expect(await s._qr).toEqual([1, 3, 6])
})

it("scans with initial value, if stopped at first element, reducer is not called", async () => {
    const fn = jest.fn((acc, x) => acc + x)
    const s = _seq([1, 2, 3]).scan(fn, 1)
    expect(fn).not.toHaveBeenCalled()
    for await (const x of s) {
        if (x === 1) {
            break
        }
    }
    expect(fn).not.toHaveBeenCalled()
})

it("scans without initial value, if stopped at first element, reducer is not called", async () => {
    const fn = jest.fn((acc, x) => acc + x)
    const s = _seq([1, 2, 3]).scan(fn)
    expect(fn).not.toHaveBeenCalled()
    for await (const x of s) {
        if (x === 1) {
            break
        }
    }
    expect(fn).not.toHaveBeenCalled()
})

it("works on infinite sequence", async () => {
    const s = _seq.repeat(Infinity, 1).scan((acc, x) => acc + x, 0)
    let count = 0
    for await (const x of s) {
        if (++count > 3) break // To avoid infinite loop in test
    }
})

it("calls reducer L - 1 times, without initial value", async () => {
    const f = jest.fn((acc, x) => acc + x)
    const s = _seq([1, 2, 3]).scan(f)
    expect(f).not.toHaveBeenCalled()
    for await (const _ of s) {
    }

    expect(f).toHaveBeenCalledTimes(2)
})

it("calls reducer L times, with initial value", async () => {
    const f = jest.fn((acc, x) => acc + x)
    const s = _seq([1, 2, 3]).scan(f, 0)
    expect(f).not.toHaveBeenCalled()
    for await (const _ of s) {
    }

    expect(f).toHaveBeenCalledTimes(3)
})

it("can iterate twice", async () => {
    const s = _seq([1, 2, 3]).scan((acc, x) => acc + x, 0)
    expect(await s._qr).toEqual([0, 1, 3, 6])
    expect(await s._qr).toEqual([0, 1, 3, 6])
})

it("can iterate twice without initial value", async () => {
    const s = _seq([1, 2, 3]).scan((acc, x) => acc + x)
    expect(await s._qr).toEqual([1, 3, 6])
    expect(await s._qr).toEqual([1, 3, 6])
})

it("accepts index as third argument", async () => {
    const s = _seq([1, 2, 3]).scan((acc, x, i) => acc + i, 0)
    expect(await s._qr).toEqual([0, 0, 1, 3])
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {
        yield 1
    })
    const s = _seq(fn)
    const lazy = s.scan(() => 1)
    expect(fn).not.toHaveBeenCalled()
    for await (const _ of lazy) {
    }
    expect(fn).toHaveBeenCalledTimes(1)
})

it("calls reducer as many times as needed", async () => {
    const fn = jest.fn((acc, x) => acc + x)
    const s = _seq([1, 2, 3]).scan(fn)
    for await (const x of s) {
        if (x > 1) {
            break
        }
    }
    expect(fn).toHaveBeenCalledTimes(1) // Checks the calls up to the break point
})

it("works for async reducers", async () => {
    const s = _seq([1, 2, 3]).scan(async (acc, x) => acc + x, 0)
    expect(await s._qr).toEqual([0, 1, 3, 6])
})
