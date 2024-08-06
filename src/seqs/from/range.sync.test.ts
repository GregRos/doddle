import type { Seq } from "@lib"
import { seq } from "@lib"
import { declare, type, type_of } from "declare-it"
type _Seq<T> = Seq<T>
const _seq = seq
declare.it("is typed as Seq<number>", expect => {
    expect(type_of(_seq.range(0, 0))).to_equal(type<_Seq<number>>)
})
declare.it("can't be called using one argument", () => {
    // @ts-expect-error
    _seq.range(1)
})
it("empty range", () => {
    expect(seq.range(0, 0)._qr).toEqual([])
})

it("singleton range", () => {
    expect(seq.range(0, 1)._qr).toEqual([0])
})

it("range of N", () => {
    expect(seq.range(0, 3)._qr).toEqual([0, 1, 2])
})

it("range of N with start", () => {
    expect(seq.range(1, 4)._qr).toEqual([1, 2, 3])
})

it("range of N with negative start", () => {
    expect(seq.range(-1, 2)._qr).toEqual([-1, 0, 1])
})

it("reverse range", () => {
    expect(seq.range(3, 0)._qr).toEqual([3, 2, 1])
})

it("reverse range with negative start", () => {
    expect(seq.range(-1, -4)._qr).toEqual([-1, -2, -3])
})

it("range with step", () => {
    expect(seq.range(0, 5, 2)._qr).toEqual([0, 2, 4])
})

it("reverse range with step", () => {
    expect(seq.range(5, 0, 2)._qr).toEqual([5, 3, 1])
})
