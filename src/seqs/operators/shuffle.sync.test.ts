import { declare, type, type_of } from "declare-it"

import type { Seq } from "../.."
import { seq } from "../.."
import { countEachItemAppearance } from "./shuffle.utils"
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
