import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

import { seq } from "../seq/seq.ctor"
import type { Seq } from "../seq/seq.class"

function countEachItemAppearance(examplars: number[][]): number[][] {
    const counts: number[][] = []

    examplars.forEach(examplar => {
        examplar.forEach((item, i) => {
            counts[item] ??= []
            counts[item][i] ??= 0
            counts[item][i]++
        })
    })
    return counts.map(xs => xs.map(x => x / examplars.length))
}
// tests shuffle
describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    declare.it("returns Seq of same type", expect => {
        const s = _seq([1, 2, 3]).shuffle()
        expect(type_of(s)).to_equal(type<_Seq<number>>)
    })

    it("returns empty on empty", () => {
        const s = _seq([]).shuffle()
        expect(s._qr).toEqual([])
    })

    it("returns singleton on singleton", () => {
        const s = _seq([1]).shuffle()
        expect(s._qr).toEqual([1])
    })

    it("returns array containing same elements", () => {
        const original = [1, 2, 3]
        const s = _seq(original).shuffle()
        expect(s._qr).toEqual(expect.arrayContaining(original))
    })

    it("randomness: every element appears in every position", () => {
        const array = [1, 2, 3, 4, 5, 6, 7]

        const shuffles = seq.repeat(10000, 1).map(() => _seq([...array]).shuffle()._qr)._qr
        const positions = countEachItemAppearance(shuffles)
        for (const [i, pos] of Object.entries(positions)) {
            for (const [j, count] of Object.entries(pos)) {
                expect(Math.abs(count - 1 / array.length)).toBeLessThan(0.15)
            }
        }
    })
})

describe("async", () => {
    const _aseq = aseq
    type _ASeq<T> = ASeq<T>

    declare.it("returns ASeq of same type", expect => {
        const s = _aseq([1, 2, 3]).shuffle()
        expect(type_of(s)).to_equal(type<_ASeq<number>>)
    })

    it("returns empty on empty", async () => {
        const s = _aseq([]).shuffle()
        expect(await s._qr).toEqual([])
    })

    it("returns singleton on singleton", async () => {
        const s = _aseq([1]).shuffle()
        expect(await s._qr).toEqual([1])
    })

    it("returns array containing same elements", async () => {
        const original = [1, 2, 3]
        const s = _aseq(original).shuffle()
        expect(await s._qr).toEqual(expect.arrayContaining(original))
    })

    it("randomness: every element appears in every position", async () => {
        const array = [1, 2, 3, 4, 5, 6, 7]

        const shuffles = await aseq.repeat(100, 1).map(() => _aseq([...array]).shuffle()._qr)._qr
        const positions = countEachItemAppearance(shuffles)
        for (const [i, pos] of Object.entries(positions)) {
            for (const [j, count] of Object.entries(pos)) {
                expect(Math.abs(count - 1 / array.length)).toBeLessThan(0.15)
            }
        }
    })
})
