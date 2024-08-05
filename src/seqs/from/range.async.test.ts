import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../.."
import { aseq } from "../.."
const _seq = aseq
type _Seq<T> = ASeq<T>
declare.it("is typed as ASeq<number>", expect => {
    expect(type_of(_seq.range(0, 0))).to_equal(type<_Seq<number>>)
})
it("empty range", async () => {
    expect(await _seq.range(0, 0)._qr).toEqual([])
})

it("singleton range", async () => {
    expect(await _seq.range(0, 1)._qr).toEqual([0])
})

it("range of N", async () => {
    expect(await _seq.range(0, 3)._qr).toEqual([0, 1, 2])
})

it("range of N with start", async () => {
    expect(await _seq.range(1, 4)._qr).toEqual([1, 2, 3])
})

it("range of N with negative start", async () => {
    expect(await _seq.range(-1, 2)._qr).toEqual([-1, 0, 1])
})

it("reverse range", async () => {
    expect(await _seq.range(3, 0)._qr).toEqual([3, 2, 1])
})

it("reverse range with negative start", async () => {
    expect(await _seq.range(-1, -4)._qr).toEqual([-1, -2, -3])
})

it("range with step", async () => {
    expect(await _seq.range(0, 5, 2)._qr).toEqual([0, 2, 4])
})

it("reverse range with step", async () => {
    expect(await _seq.range(5, 0, 2)._qr).toEqual([5, 3, 1])
})
