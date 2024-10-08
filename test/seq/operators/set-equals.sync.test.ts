import { Doddle, seq, Seq } from "@lib"
import { declare, type, type_of } from "declare-it"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("accepts an input sequence, returns Doddle<boolean>", expect => {
    const s = null! as _Seq<number>
    expect(type_of(s.setEquals(s))).to_equal(type<Doddle<boolean>>)
})
declare.it("accepts input sequence of subtype, returns Doddle<boolean>", expect => {
    const s1 = null! as _Seq<number>
    const s2 = null! as _Seq<1 | 2 | 3>
    expect(type_of(s1.setEquals(s2))).to_equal(type<Doddle<boolean>>)
})
declare.it("accepts input sequence of supertype, returns Doddle<boolean>", expect => {
    const s1 = null! as _Seq<1 | 2 | 3>
    const s2 = null! as _Seq<number>
    expect(type_of(s1.setEquals(s2))).to_equal(type<Doddle<boolean>>)
})
declare.it("doesn't accept non-subtype, non-supertype inputs", expect => {
    const s1 = null! as _Seq<1 | 2>
    const s2 = null! as _Seq<2 | 3>
    // @ts-expect-error
    s1.setEquals(s2)
})
it("returns true for empty sequences", () => {
    const s = _seq([]).setEquals(_seq([]))
    expect(s.pull()).toEqual(true)
})
it("returns false for empty vs singleton", () => {
    const s = _seq([]).setEquals(_seq([1]))
    expect(s.pull()).toEqual(false)
})

it("returns true for same sequence", () => {
    const s = _seq([1, 2, 3]).setEquals(_seq([1, 2, 3]))
    expect(s.pull()).toEqual(true)
})

it("returns true for same sequence in different order", () => {
    const s = _seq([1, 2, 3]).setEquals(_seq([3, 2, 1]))
    expect(s.pull()).toEqual(true)
})

it("returns false for different sequences", () => {
    const s = _seq([1, 2, 3]).setEquals(_seq([1, 2, 4]))
    expect(s.pull()).toEqual(false)
})

it("returns false for subsets", () => {
    const s = _seq([1, 2, 3]).setEquals(_seq([1, 2]))
    expect(s.pull()).toEqual(false)
})

it("returns false for different elements", () => {
    const s = _seq([1, 2, 3]).setEquals(_seq([1, 2, "3"]))
    expect(s.pull()).toEqual(false)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {
        yield 1
    })
    const s = _seq(fn)
    const doddle = s.setEquals(s)
    expect(fn).not.toHaveBeenCalled()
    doddle.pull()
    expect(fn).toHaveBeenCalledTimes(2)
})

it("accepts different seq input types", () => {
    const s1 = _seq([1, 2])
    expect(
        s1
            .setEquals(function* () {
                yield 1
                yield 2
            })
            .pull()
    ).toEqual(true)
    expect(s1.setEquals([1, 2]).pull()).toEqual(true)
    expect(s1.setEquals(() => s1[Symbol.iterator]()).pull()).toEqual(true)
})
