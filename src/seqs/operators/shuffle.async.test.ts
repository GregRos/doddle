import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../.."
import { aseq } from "../.."
import { countEachItemAppearance } from "./shuffle.utils"
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
    for (const [, pos] of Object.entries(positions)) {
        for (const [, count] of Object.entries(pos)) {
            expect(Math.abs(count - 1 / array.length)).toBeLessThan(0.15)
        }
    }
})
