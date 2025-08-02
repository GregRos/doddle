import { DoddleError } from "@error"
import type { Doddle, Seq } from "@lib"
import { doddle, seq } from "@lib"
import { declare, type, type_of } from "declare-it"
import { Dummy } from "./input.utils.helper"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("can't be called using non-iterable argument", () => {
    // @ts-expect-error
    _seq(1)
})
declare.it("element type same as array", expect => {
    expect(type_of(_seq([1, 2, 3]))).to_equal(type<_Seq<number>>)
})
declare.it("element type is same as iterable", expect => {
    const s = _seq(null! as Iterable<string>)
    expect(type_of(s)).to_equal(type<_Seq<string>>)
})
declare.it("can specify type when converting from array", expect => {
    const s = _seq<1>([1])
    expect(type_of(s)).to_equal(type<_Seq<1>>)
    _seq<number>([])
})
declare.it("can specify type when converting from empty array", expect => {
    const s = _seq<1>([])
    expect(type_of(s)).to_equal(type<_Seq<1>>)
})

declare.it("can specify type when converting from nothing", expect => {
    const s = _seq<1>([])
    expect(type_of(s)).to_equal(type<_Seq<1>>)
})
declare.it("cannot be called using async iterable", () => {
    // @ts-expect-error
    _seq(new Dummy._AsyncIterable())
})
declare.it("same as Promise type for iterable of promises", expect => {
    const s = _seq(null! as Iterable<Promise<string>>)
    expect(type_of(s)).to_equal(type<_Seq<Promise<string>>>)
})

declare.it("cannot be called using async iterator", () => {
    // @ts-expect-error
    _seq(new Dummy._AsyncIterator())
})

declare.it("cannot be called using function returning async iterable", () => {
    // @ts-expect-error
    _seq(() => new Dummy._AsyncIterable())
})
declare.it("cannot be called using function returning async iterator", () => {
    // @ts-expect-error
    _seq(() => new Dummy._AsyncIterator())
})
declare.it("element type same as doddle's value type", expect => {
    const s = _seq(doddle(() => [1]))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("works with array-like object (NodeList)", expect => {
    const nodeList = document.querySelectorAll("*")
    expect(type_of(_seq(nodeList))).to_equal(type<_Seq<Element>>)
})

declare.it("element type is correct for plain array-like object", expect => {
    const arrayLike = { 0: "a", 1: "b", length: 2 }
    expect(type_of(_seq(arrayLike))).to_equal(type<_Seq<string>>)
})

declare.it("empty plain array-like object gives empty seq", expect => {
    const arrayLike = { length: 0 }
    expect(type_of(_seq(arrayLike)._qr)).to_equal(type<unknown[]>)
})

declare.it("fails if object has no length", () => {
    // @ts-expect-error
    _seq({ 0: "a", 1: "b" })
})

declare.it("element type is doddle value type for iterable of doddle", expect => {
    const s = _seq(null! as Iterable<Doddle<number>>)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("element type is promise type for iterable of doddle async", expect => {
    const s = _seq(null! as Iterable<Doddle<Promise<number>>>)
    expect(type_of(s)).to_equal(type<_Seq<Promise<number>>>)
})

declare.it("fails if explicitly given a string", expect => {
    // @ts-expect-error
    _seq("a")
})

declare.it("works for generic iterable", expect => {
    function _<T extends Iterable<any>>() {
        _seq(null! as Iterable<T>)
    }
})
it("throws immediately if given a string", () => {
    expect(() => _seq("a" as any)).toThrow(DoddleError)
})

it("throws on iteration if given a function returning a string", () => {
    const iterable = _seq(() => "a" as any)
    expect(() => {
        for (const _ of iterable) {
        }
    }).toThrow(DoddleError)
})
it("empty argslist gives empty seq", () => {
    expect(_seq([])._qr).toEqual([])
})
it("converts from array", () => {
    expect(_seq([1, 2, 3])._qr).toEqual([1, 2, 3])
})
it("converts from empty array", () => {
    expect(_seq([])._qr).toEqual([])
})
it("converts from iterable", () => {
    const iterable = seq(new Dummy._Iterable())
    expect(iterable._qr).toEqual([0, 1, 2])
})

it("converts from function returning iterator", () => {
    const iterable = seq(() => new Dummy._Iterator())
    expect(iterable._qr).toEqual([0, 1, 2])
})
it("converts from doddle of iterable", () => {
    const iterable = seq(doddle(() => [1]))
    expect(iterable._qr).toEqual([1])
})
it("converts from function returning doddle of iterable", () => {
    const iterable = seq(() => doddle(() => [1]))
    expect(iterable._qr).toEqual([1])
})
it("converts from iterable of lazies", () => {
    const iterable = seq([doddle(() => 1)])
    expect(iterable._qr).toEqual([1])
})

it("errors if given something else", () => {
    expect(() => seq(1 as any)).toThrow(DoddleError)
})
it("errors if given an async iterable", () => {
    expect(() => seq(new Dummy._AsyncIterable() as any)).toThrow(DoddleError)
})
it("errors when iterated when given a function returning something else", () => {
    const iterable = seq(() => 1 as any)
    expect(() => [...iterable]).toThrow(DoddleError)
})
it("errors when iterated when given a function returning async iterable", () => {
    const iterable = seq(() => new Dummy._AsyncIterable() as any)
    expect(() => [...iterable]).toThrow()
})
it("errors on iteration when given a function returning an async iterator", () => {
    const iterable = seq(() => new Dummy._AsyncIterator() as any)
    expect(() => [...iterable]).toThrow()
})
it("errors when iterated if source errors", () => {
    const iterable = seq(function* () {
        throw new Error("source error")
    })
    expect(() => [...iterable]).toThrow("source error")
})

it("calls next as many times as needed", () => {
    const it = new Dummy._Iterator()
    it.next = jest.fn(it.next)
    seq(() => it)
    for (const _ of seq(() => it)) {
        break
    }
    expect(it.next).toHaveBeenCalledTimes(1)
})
it("converts from function returning iterable", () => {
    const iterable = seq(() => [1, 2])
    expect(iterable._qr).toEqual([1, 2])
})

it("caches iterator returning function", async () => {
    const iterable = _seq(() => new Dummy._Iterator())
    const a = iterable._qr
    const b = iterable._qr
    expect(a).toEqual(b)
})

it("works for array-like objects", () => {
    const arrayLike = { 0: 10, 1: 20, 2: 30, length: 3 }
    expect(_seq(arrayLike)._qr).toEqual([10, 20, 30])
    const int32Array = new Int32Array([1, 2, 3])
    expect(_seq(int32Array)._qr).toEqual([1, 2, 3])
    const emptyArrayLike = { length: 0 }
    expect(_seq(emptyArrayLike)._qr).toEqual([])
})
