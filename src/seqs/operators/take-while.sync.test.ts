import { declare, type, type_of } from "declare-it"

import type { Seq } from "../.."
import { seq } from "../.."
const _seq = seq
type _Seq<T> = Seq<T>
describe("type tests", () => {
    declare.it("keeps same type as input when no ellipsis is given", expect => {
        expect(type_of(_seq([1]).takeWhile(() => true))).to_equal(type<_Seq<number>>)
    })
    declare.it("disjunction with ellipsis if specified", expect => {
        expect(type_of(_seq([1]).takeWhile(() => true))).to_equal(type<_Seq<number>>)
    })
})

it("immediate false gives empty", () => {
    const s = _seq([1, 2, 3]).takeWhile(() => false)
    expect(s._qr).toEqual([])
})

it("constant true gives same", () => {
    const s = _seq([1, 2, 3]).takeWhile(() => true)
    expect(s._qr).toEqual([1, 2, 3])
})

it("stops at first false", () => {
    const s = _seq([1, 2, 3, 4, 5]).takeWhile(x => x < 3)
    expect(s._qr).toEqual([1, 2])
})

it("stops at first false with index", () => {
    const s = _seq([1, 2, 3, 4, 5]).takeWhile((x, i) => i < 3)
    expect(s._qr).toEqual([1, 2, 3])
})

it("has no side-effects, pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        yield 2
        expect(false).toBe(true)
    })
    _seq(sq).takeWhile(x => x < 2)
    expect(sq).not.toHaveBeenCalled()
    expect(_seq(sq).takeWhile(x => x < 2)._qr).toEqual([1])
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", () => {
    const f = jest.fn(x => x < 2)
    const s = _seq([1, 2, 3, 4, 5]).takeWhile(f)
    for (const _ of s) {
    }
    expect(f).toHaveBeenCalledTimes(2)
})
