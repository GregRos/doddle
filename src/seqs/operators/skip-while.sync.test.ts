import { declare, type, type_of } from "declare-it"

import type { Seq } from "../.."
import { seq } from "../.."
const _seq = seq
type _Seq<T> = Seq<T>
describe("type tests", () => {
    declare.it("keeps same type as input when no ellipsis is given", expect => {
        expect(type_of(_seq([1]).skipWhile(() => true))).to_equal(type<_Seq<number>>)
    })
})

it("immediate false gives same", () => {
    const s = _seq([1, 2, 3]).skipWhile(() => false)
    expect(s._qr).toEqual([1, 2, 3])
})

it("constant true gives empty", () => {
    const s = _seq([1, 2, 3]).skipWhile(() => true)
    expect(s._qr).toEqual([])
})

it("discards while true", () => {
    const s = _seq([1, 2, 3, 4, 5]).skipWhile(x => x < 3)
    expect(s._qr).toEqual([3, 4, 5])
})

it("discards while true with index", () => {
    const s = _seq([1, 2, 3, 4, 5]).skipWhile((x, i) => i < 3)
    expect(s._qr).toEqual([4, 5])
})

it("has no side-effects, pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).skipWhile(x => x < 2)
    expect(sq).not.toHaveBeenCalled()
    for (const x of tkw) {
        expect(x).toBe(2)
        break
    }
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", () => {
    const f = jest.fn(x => x < 2)
    const s = _seq([1, 2, 3, 4, 5]).skipWhile(f)
    expect(f).not.toHaveBeenCalled()
    for (const x of s) {
        expect(x).toBe(2)
        break
    }
    expect(f).toHaveBeenCalledTimes(2)
})
