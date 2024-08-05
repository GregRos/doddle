import { declare, type, type_of } from "declare-it"

import type { ASeq } from "../.."
import { aseq } from "../.."
const _aseq = aseq
type _ASeq<T> = ASeq<T>

declare.it("should type as ASeq<T>", expect => {
    expect(type_of(_aseq([1, 2, 3]).each(() => {}))).to_equal(type<_ASeq<number>>)
})

declare.it("can be called with no stages", expect => {
    const s = _aseq([1, 2, 3]).each(() => {})
    expect(type_of(s)).to_equal(type<_ASeq<number>>)
})

declare.it("can be called with before, after, both, or undefined", expect => {
    const s = _aseq([1, 2, 3])
    expect(type_of(s.each(() => {}, "before"))).to_equal(type<_ASeq<number>>)
    expect(type_of(s.each(() => {}, "after"))).to_equal(type<_ASeq<number>>)
    expect(type_of(s.each(() => {}, "both"))).to_equal(type<_ASeq<number>>)
    expect(type_of(s.each(() => {}, undefined))).to_equal(type<_ASeq<number>>)
})

declare.it("can't be called with other strings", expect => {
    // @ts-expect-error
    _aseq([1, 2, 3]).each(() => {}, "other")
})

it("calls iteratee with after", async () => {
    const fn = jest.fn()
    const e = _aseq([1, 2, 3]).each(fn, "after")
    expect(fn).not.toHaveBeenCalled()

    for await (const x of e) {
        expect(fn).toHaveBeenCalledTimes(x - 1)
        if (x !== 1) {
            expect(fn).toHaveBeenLastCalledWith(x - 1, x - 2, "after")
        }
    }
    expect(fn).toHaveBeenLastCalledWith(3, 2, "after")
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls iteratee with before", async () => {
    const fn = jest.fn()
    const e = _aseq([1, 2, 3]).each(fn, "before")
    expect(fn).not.toHaveBeenCalled()

    for await (const x of e) {
        expect(fn).toHaveBeenCalledTimes(x)
        expect(fn).toHaveBeenLastCalledWith(x, x - 1, "before")
    }
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls iteratee with both", async () => {
    const fn = jest.fn()
    const e = _aseq([1, 2, 3]).each(fn, "both")
    expect(fn).not.toHaveBeenCalled()

    for await (const x of e) {
        expect(fn).toHaveBeenCalledTimes(2 * x - 1)
        expect(fn).toHaveBeenLastCalledWith(x, x - 1, "before")
        if (x !== 1) {
            expect(fn).toHaveBeenCalledWith(x - 1, x - 2, "after")
        }
    }
    expect(fn).toHaveBeenCalledTimes(6)
    expect(fn).toHaveBeenLastCalledWith(3, 2, "after")
})

it("defaults to before", async () => {
    const fn = jest.fn()
    for await (const x of _aseq([1, 2, 3]).each(fn)) {
        expect(fn).toHaveBeenCalledTimes(x)
    }
    expect(fn).toHaveBeenCalledTimes(3)
})

it("errors immediately if iteratee is not a function", async () => {
    await expect(async () => {
        // @ts-expect-error

        await _aseq([1, 2, 3]).each(1)._qr
    }).rejects.toThrow()
})

it("errors immediately if stage is not a valid string", async () => {
    await expect(async () => {
        // @ts-expect-error

        await _aseq([1, 2, 3]).each(() => {}, "other")._qr
    }).rejects.toThrow()
})

it("can iterate twice", async () => {
    const fn = jest.fn()
    const e = _aseq([1, 2, 3]).each(fn)
    await e._qr
    await e._qr
    expect(fn).toHaveBeenCalledTimes(6) // called 3 times for each iteration
})
