import { declare, type, type_of } from "declare-it"

import type { Seq } from "@lib"
import { Doddle, seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("works on empty", expect => {
    const s = _seq([]).drain()
    expect(type_of(s)).to_equal(type<Doddle<void>>)
})

it("does nothing on empty", () => {
    const mock = jest.fn()
    const s = _seq([]).each(mock).drain().pull()
    expect(s).toEqual(undefined)
})

it("drains elements", () => {
    const mock = jest.fn()
    const s = _seq([1, 2, 3]).each(mock).drain().pull()
    expect(s).toEqual(undefined)
    expect(mock).toHaveBeenCalledTimes(3)
    expect(mock.mock.calls).toEqual([[1], [2], [3]])
})

it("no side-effects before pull", () => {
    const mock = jest.fn()
    const s = _seq([1, 2, 3]).each(mock).drain()
    expect(mock).not.toHaveBeenCalled()
    s.pull()
    expect(mock).toHaveBeenCalledTimes(3)
})

it("drains twice", () => {
    const mock = jest.fn()
    const s = _seq([1, 2, 3]).each(mock)
    s.drain().pull()
    s.drain().pull()
    expect(mock).toHaveBeenCalledTimes(6)
})

it("drains twice", () => {
    const mock = jest.fn()
    const s = _seq([1, 2, 3]).each(mock).drain().pull()
    expect(s).toEqual(undefined)
    expect(mock).toHaveBeenCalledTimes(3)
    expect(mock.mock.calls).toEqual([[1], [2], [3]])
})

it("propagates error", () => {
    const mock = jest.fn(() => {
        throw new Error("error")
    })
    const s = _seq([1, 2, 3]).each(mock).drain()
    expect(() => s.pull()).toThrow()
})
