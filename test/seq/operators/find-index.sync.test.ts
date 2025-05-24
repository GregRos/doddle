import { declare, type, type_of } from "declare-it"

import type { Doddle, Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("returns a Doddle<number>", expect => {
    const s = _seq([1, 2, 3]).findIndex(x => x === 1)
    expect(type_of(s)).to_equal(type<Doddle<number>>)
})

it("returns -1 on empty", () => {
    const s = _seq([])
        .findIndex(x => x === 1)
        .pull()
    expect(s).toEqual(-1)
})

it("returns -1 on no match", () => {
    const s = _seq([2, 3])
        .findIndex(x => x === 1)
        .pull()
    expect(s).toEqual(-1)
})

it("returns index on match", () => {
    const s = _seq([1, 2, 3])
        .findIndex(x => x === 1)
        .pull()
    expect(s).toEqual(0)
})

it("returns index on match (2)", () => {
    const s = _seq([2, 1, 3])
        .findIndex(x => x === 1)
        .pull()
    expect(s).toEqual(1)
})

it("no side-effects before pull", () => {
    const mock = jest.fn()
    const s = _seq([1, 2, 3]).findIndex(mock)
    expect(mock).not.toHaveBeenCalled()
    s.pull()
    expect(mock).toHaveBeenCalledTimes(3)
})

it("pulls as many as needed", () => {
    const sq = jest.fn()
    const tkw = _seq([2, 1, 3]).findIndex(x => x === 1)
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(2)
})
