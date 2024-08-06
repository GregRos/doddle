import { declare, type, type_of } from "declare-it"

import type { Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type SType<T> = Seq<T>
declare.it("typed as 1-N length tuple", expect => {
    expect(type_of(_seq([1, 2, 3]).chunk(3))).to_equal(
        type<SType<[number] | [number, number] | [number, number, number]>>
    )
    expect(type_of(_seq([1, 2, 3]).chunk(1))).to_equal(type<SType<[number]>>)
})

declare.it("typed as length 1-∞ tuple when non-literal chunk length", expect => {
    const s = _seq([1, 2, 3]).chunk(3 as number)
    expect(type_of(s)).to_equal(type<SType<[number, ...number[]]>>)
})

declare.it("projection parameters typed as [T, T? ...]", expect => {
    _seq([1, 2, 3]).window(2, (...args) => {
        expect(type_of(args)).to_equal(type<[number, number?]>)
    })
    _seq([1, 2, 3]).window(3, (...args) => {
        expect(type_of(args)).to_equal(type<[number, number?, number?]>)
    })
})

declare.it("accepts projection with N parameters", expect => {
    _seq([1, 2, 3]).window(2, (a, b) => {
        expect(type_of(a)).to_equal(type<number>)
        expect(type_of(b)).to_equal(type<number | undefined>)
    })
})
it("chunks empty as empty", () => {
    const s = _seq([]).chunk(1)
    expect(s._qr).toEqual([])
})

it("chunks singletons correctly", () => {
    const s = _seq([1, 2, 3]).chunk(1)
    expect(s._qr).toEqual([[1], [2], [3]])
})

it("chunks pairs", () => {
    const s = _seq([1, 2, 3, 4, 5]).chunk(2)
    expect(s._qr).toEqual([[1, 2], [3, 4], [5]])
})

it("errors on length of 0", () => {
    expect(() => _seq([1, 2, 3]).chunk(0)).toThrow("must be positive")
})

it("is not eager", () => {
    const s = seq.repeat(Infinity, 1)
    const chunked = s.chunk(3)
    for (const _ of chunked) {
        break
    }
})

it("doesn't pull more than necessary", () => {
    const iter = jest.fn(function* () {
        yield 1
        yield 2
        fail("should not pull next element")
    })
    const s = _seq(iter)
    const chunked = s.chunk(2)
    expect(iter).not.toHaveBeenCalled()
    for (const _ of chunked) {
        break
    }
})

it("can iterate twice", () => {
    const s = _seq([1, 2, 3]).chunk(2)
    expect(s._qr).toEqual([[1, 2], [3]])
    expect(s._qr).toEqual([[1, 2], [3]])
})

it("chunks empty as empty with projection", () => {
    const s = _seq([]).chunk(1, _ => 1)
    expect(s._qr).toEqual([])
})
it("chunks empty as empty with projection", () => {
    const s = _seq([]).chunk(1, _ => 1)
    expect(s._qr).toEqual([])
})
it("projects singleton chunks correctly", () => {
    const s = _seq([1, 2, 3]).chunk(1, x => x + 1)
    expect(s._qr).toEqual([2, 3, 4])
})
it("projects pairs", () => {
    const s = _seq([1, 2, 3, 4]).chunk(2, (a, b) => a + b!)
    expect(s._qr).toEqual([3, 7])
})

describe("invalid inputs", () => {
    describe("throws on invocation", () => {
        it("negative chunk length", () => {
            expect(() => _seq([1, 2, 3]).chunk(-1)).toThrow()
        })

        it("non-number chunk length", () => {
            // @ts-expect-error
            expect(() => _seq([1, 2, 3]).chunk("1")).toThrow()
        })

        it("non-integer chunk length", () => {
            expect(() => _seq([1, 2, 3]).chunk(0.5)).toThrow()
            expect(() => _seq([1, 2, 3]).chunk(NaN)).toThrow()
            expect(() => _seq([1, 2, 3]).chunk(Infinity)).toThrow()
            expect(() => _seq([1, 2, 3]).chunk(-Infinity)).toThrow()
        })

        it("bigint chunk length", () => {
            // @ts-expect-error
            expect(() => _seq([1, 2, 3]).chunk(1n)).toThrow()
        })
    })
})
