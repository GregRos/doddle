import { Doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

import type { Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("accepts an input sequence, returns Doddle<boolean>", expect => {
    const s = null! as _Seq<number>
    expect(type_of(s.seqEquals(s))).to_equal(type<Doddle<boolean>>)
})
declare.it("accepts input sequence of subtype, returns Doddle<boolean>", expect => {
    const s1 = null! as _Seq<number>
    const s2 = null! as _Seq<1 | 2 | 3>
    expect(type_of(s1.seqEquals(s2))).to_equal(type<Doddle<boolean>>)
})
declare.it("accepts input sequence of supertype, returns Doddle<boolean>", expect => {
    const s1 = null! as _Seq<1 | 2 | 3>
    const s2 = null! as _Seq<number>
    expect(type_of(s1.seqEquals(s2))).to_equal(type<Doddle<boolean>>)
})
declare.it("doesn't accept non-subtype, non-supertype inputs", expect => {
    const s1 = null! as _Seq<1 | 2>
    const s2 = null! as _Seq<2 | 3>
    // @ts-expect-error
    expect(type_of(s1.seqEquals(s2))).to_equal(type<Doddle<boolean>>)
})
it("returns true for empty sequences", () => {
    const s = _seq([]).seqEquals(_seq([]))
    expect(s.pull()).toEqual(true)
})
it("returns false for empty vs singleton", () => {
    const s = _seq([]).seqEquals(_seq([1]))
    expect(s.pull()).toEqual(false)
})

it("returns true for same sequence", () => {
    const s = _seq([1, 2, 3]).seqEquals(_seq([1, 2, 3]))
    expect(s.pull()).toEqual(true)
})

it("returns false for different sequences", () => {
    const s = _seq([1, 2, 3]).seqEquals(_seq([1, 2, 4]))
    expect(s.pull()).toEqual(false)
})

it("returns false for different lengths", () => {
    const s = _seq([1, 2, 3]).seqEquals(_seq([1, 2]))
    expect(s.pull()).toEqual(false)
})

it("returns false for different elements", () => {
    const s = _seq([1, 2, 3]).seqEquals(_seq([1, 2, "3"]))
    expect(s.pull()).toEqual(false)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const doddle = s.seqEquals(s)
    expect(fn).not.toHaveBeenCalled()
    doddle.pull()
    expect(fn).toHaveBeenCalledTimes(2)
})

it("accepts different seq input types", () => {
    const s1 = _seq([1, 2])
    expect(
        s1
            .seqEquals(function* () {
                yield 1
                yield 2
            })
            .pull()
    ).toEqual(true)
    expect(s1.seqEquals([1, 2]).pull()).toEqual(true)
    expect(s1.seqEquals(() => s1[Symbol.iterator]()).pull()).toEqual(true)
})
