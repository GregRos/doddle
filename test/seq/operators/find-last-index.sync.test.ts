import { declare, type, type_of } from "declare-it"

import type { Doddle, Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>

declare.it("returns a Doddle<number>", expect => {
    const s = _seq([1, 2, 3]).findLastIndex(x => x === 1)
    expect(type_of(s)).to_equal(type<Doddle<number>>)
})

it("returns -1 on empty", () => {
    const s = _seq([])
        .findLastIndex(x => x === 1)
        .pull()
    expect(s).toEqual(-1)
})

it("returns -1 on no match", () => {
    const s = _seq([2, 3])
        .findLastIndex(x => x === 1)
        .pull()
    expect(s).toEqual(-1)
})

it("returns last index on match", () => {
    const s = _seq([1, 2, 1])
        .findLastIndex(x => x === 1)
        .pull()
    expect(s).toEqual(2)
})

it("returns last index on match (2)", () => {
    const s = _seq([2, 1, 3, 1])
        .findLastIndex(x => x === 1)
        .pull()
    expect(s).toEqual(3)
})

it("no side-effects before pull", () => {
    const mock = jest.fn()
    const s = _seq([1, 2, 3]).findLastIndex(mock)
    expect(mock).not.toHaveBeenCalled()
    s.pull()
    expect(mock).toHaveBeenCalledTimes(3)
})

it("pulls as many as needed", () => {
    const sq = jest.fn()
    const tkw = _seq([2, 1, 3, 1]).findLastIndex(x => x === 1)
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(4)
})
