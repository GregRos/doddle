import { declare, type, type_of } from "declare-it"
import type { Lazy } from "../../lazy"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
const f = seq
type SType<T> = Seq<T>
declare.test("should type as Lazy<T | undefined>", expect => {
    expect(type_of(f([1, 2, 3]).findLast(() => true))).to_equal(type<Lazy<number | undefined>>)
})
declare.test("should type as Lazy<T | string> with alt", expect => {
    expect(type_of(f([1, 2, 3]).findLast(() => true, "alt" as string))).to_equal(
        type<Lazy<number | string>>
    )
})
declare.test("should type as Lazy<T | 'alt'> with alt", expect => {
    expect(type_of(f([1, 2, 3]).findLast(() => true, "alt"))).to_equal(type<Lazy<number | "alt">>)
})

it("returns undefined for empty", () => {
    const s = f([]).findLast(() => true)
    expect(s.pull()).toEqual(undefined)
})

it("returns undefined for no matches", () => {
    const s = f([1, 2, 3]).findLast(() => false)
    expect(s.pull()).toEqual(undefined)
})

it("returns alt for no matches with alt", () => {
    const s = f([1, 2, 3]).findLast(() => false, "alt")
    expect(s.pull()).toEqual("alt")
})

it("returns last match", () => {
    const s = f([1, 2, 3, 4]).findLast(() => true)
    expect(s.pull()).toEqual(4)
})

it("returns last match even with alt", () => {
    const s = f([1, 2, 3, 4]).findLast(() => true, 10)
    expect(s.pull()).toEqual(4)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = f(fn)
    const lazy = s.findLast(() => true)
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        yield 2
        yield 3
    })
    const tkw = f(sq).findLast(() => true)
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", () => {
    const fn = jest.fn(x => x === 3)
    const s = f([1, 2, 3, 4, 3]).findLast(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(5)
})
