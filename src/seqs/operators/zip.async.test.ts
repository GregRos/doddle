import { declare, type, type_of } from "declare-it"

import type { ASeq } from "../../index.js"
import { aseq } from "../../index.js"
const _aseq = aseq
type _ASeq<T> = ASeq<T>

declare.it(
    "when input is tuple, typed as length N tuple with possibly undefined elements",
    expect => {
        expect(type_of(aseq.of(1, 2, 3).zip([["a", "b"]]))).to_equal(
            type<_ASeq<[number | undefined, string | undefined]>>
        )
    }
)

declare.it("returns ASeq of same type", expect => {
    const s = _aseq([1, 2, 3]).zip([["a", "b"]])
    expect(type_of(s)).to_equal(type<_ASeq<[number | undefined, string | undefined]>>)
})

it("returns empty on empty", async () => {
    const s = _aseq([]).zip([[]])
    expect(await s._qr).toEqual([])
})

it("returns singleton on singleton", async () => {
    const s = _aseq([1]).zip([["a"]])
    expect(await s._qr).toEqual([[1, "a"]])
})

it("returns array containing same elements", async () => {
    const original = [1, 2, 3]
    const s = _aseq(original).zip([["a", "b", "c"]])
    expect(await s._qr).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "c"]
    ])
})

it("randomness: every element appears in every position", async () => {
    const array = [1, 2, 3, 4, 5]
    const other = ["a", "b", "c", "d", "e"]
    const s = _aseq(array).zip([other])
    expect(await s._qr).toEqual(array.map((x, i) => [x, other[i]]))
})

it("no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {
        yield 1
        yield 2
        yield 3
    })
    const input = _aseq(fn)
    const result = input.zip([["a", "b", "c"]])
    expect(fn).not.toHaveBeenCalled()
    await result._qr
    expect(fn).toHaveBeenCalledTimes(1)
})

it("zips with projection gives projection type", async () => {
    const s = _aseq([1, 2, 3]).zip([["a", "b", "c"]], (a, b) => a + b!)
    expect(await s._qr).toEqual(["1a", "2b", "3c"])
})

it("can iterate twice", async () => {
    const s = _aseq([1, 2, 3]).zip([["a", "b"]])
    expect(await s._qr).toEqual([
        [1, "a"],
        [2, "b"],
        [3, undefined]
    ])
    expect(await s._qr).toEqual([
        [1, "a"],
        [2, "b"],
        [3, undefined]
    ])
})

it("zips length 3 + length 1 pads with undefined", async () => {
    const s = _aseq([1, 2, 3]).zip([["a"]])
    expect(await s._qr).toEqual([
        [1, "a"],
        [2, undefined],
        [3, undefined]
    ])
})

it("handles undefined in sequence but doesn't distinguish", async () => {
    const s = _aseq([1, 2, 3]).zip([["a", undefined, "c"]])
    expect(await s._qr).toEqual([
        [1, "a"],
        [2, undefined],
        [3, "c"]
    ])
})

it("doesn't pull more than necessary", async () => {
    const each = jest.fn()
    const iter = jest.fn(async function* () {
        yield 1
        yield 2
        fail("should not pull next element")
    })
    const s = _aseq(iter).each(each)
    const zipped = s.zip([[]])
    expect(iter).not.toHaveBeenCalled()
    expect(each).not.toHaveBeenCalled()
    for await (const _ of zipped) {
        break
    }
    expect(iter).toHaveBeenCalledTimes(1)
    expect(each).toHaveBeenCalledTimes(1)
})
