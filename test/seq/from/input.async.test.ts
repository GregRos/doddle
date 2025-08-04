import { DoddleError } from "@error"
import type { ASeq, Doddle } from "@lib"
import { aseq, doddle } from "@lib"
import { declare, type, type_of } from "declare-it"
import { Dummy } from "./input.utils.helper"
const _seq = aseq
type _Seq<T> = ASeq<T>

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

declare.it("element type same as async iterable", expect => {
    const s = _seq(null! as AsyncIterable<string>)
    expect(type_of(s)).to_equal(type<_Seq<string>>)
})

declare.it("element type same as promised value for iterable of promises", expect => {
    const s = _seq(null! as Iterable<Promise<string>>)
    expect(type_of(s)).to_equal(type<_Seq<string>>)
})

declare.it("element type same as promised value for async iterable of promises", expect => {
    const s = _seq(null! as AsyncIterable<Promise<string>>)
    expect(type_of(s)).to_equal(type<_Seq<string>>)
})

declare.it("element type same as doddle's value type", expect => {
    const s = _seq(doddle(() => [1]))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("element type is doddle value type for doddle async", expect => {
    const s = _seq(doddle(async () => [1]))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("element type is doddle value type for iterable of doddle", expect => {
    const s = _seq(null! as Iterable<Doddle<number>>)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("element type ivalue type for iterable of doddle async", expect => {
    const s = _seq(null! as Iterable<Doddle<Promise<number>>>)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})
declare.it("fails if explicitly given a string", expect => {
    // @ts-expect-error
    _seq("a")
})

declare.it("fails if explicitly given a () => string", expect => {
    // @ts-expect-error
    _seq(() => "a")
})

declare.it("works for generic Iterable<T> and () => Iterable<T>", expect => {
    function _<T extends Iterable<any>>() {
        _seq(null! as Iterable<T>)
        _seq(() => null! as Iterable<T>)
    }
})

it("throws immediately if given a string", () => {
    expect(() => _seq("a" as any)).toThrow(DoddleError)
})

it("throws on iteration if given a function returning a string", async () => {
    const iterable = _seq(() => "a" as any)
    await expect(async () => {
        for await (const _ of iterable) {
            // Drain
        }
    }).rejects.toThrow(DoddleError)
})

it("empty argslist gives empty aseq", async () => {
    expect(await _seq([])._qr).toEqual([])
})

it("converts from array", async () => {
    expect(await _seq([1, 2, 3])._qr).toEqual([1, 2, 3])
})

it("converts from empty array", async () => {
    expect(await _seq([])._qr).toEqual([])
})

it("converts from iterable", async () => {
    const iterable = _seq(new Dummy._Iterable())
    expect(await iterable._qr).toEqual([0, 1, 2])
})

it("converts from function returning iterator", async () => {
    const iterable = _seq(() => new Dummy._Iterator())
    expect(await iterable._qr).toEqual([0, 1, 2])
})

it("caches iterator returning function", async () => {
    const iterable = _seq(() => new Dummy._AsyncIterator())
    const a = await iterable._qr
    const b = await iterable._qr
    expect(a).toEqual(b)
})

it("caches lazy iterator returning function", async () => {
    const iterable = _seq(() => doddle(() => new Dummy._AsyncIterator()))
    const a = await iterable._qr
    const b = await iterable._qr
    expect(a).toEqual(b)
})

it("converts from doddle of array", async () => {
    const iterable = _seq(doddle(() => [1]))
    expect(await iterable._qr).toEqual([1])
})

it("converts from function returning doddle", async () => {
    const iterable = _seq(() => doddle(() => [1]))
    expect(await iterable._qr).toEqual([1])
})

it("converts from async iterable", async () => {
    const iterable = _seq(new Dummy._AsyncIterable())
    expect(await iterable._qr).toEqual([0, 1, 2])
})

it("converts from function returning async iterable", async () => {
    const iterable = _seq(() => new Dummy._AsyncIterable())
    expect(await iterable._qr).toEqual([0, 1, 2])
})

it("converts from function returning async iterator", async () => {
    const iterable = _seq(() => new Dummy._AsyncIterator())
    expect(await iterable._qr).toEqual([0, 1, 2])
})

it("converts from function returning an async doddle", async () => {
    const iterable = _seq(() => doddle(async () => [1]))
    expect(await iterable._qr).toEqual([1])
})

it("errors on iteration when given a function returning something else", async () => {
    const iterable = _seq(() => 1 as any)
    await expect(async () => {
        for await (const _ of iterable) {
            // Drain
        }
    }).rejects.toThrow(DoddleError)
})

it("errors when iterated if source errors", async () => {
    const iterable = _seq(function* () {
        throw new Error("source error")
    })
    await expect(async () => {
        for await (const _ of iterable) {
            // Drain
        }
    }).rejects.toThrow("source error")
})

it("errors when iterated if source errors with async", async () => {
    const iterable = _seq(async function* () {
        throw new Error("source error")
    })
    await expect(async () => {
        for await (const _ of iterable) {
            // Drain
        }
    }).rejects.toThrow("source error")
})

it("calls next as many times as needed", async () => {
    const it = new Dummy._Iterator()
    it.next = jest.fn(it.next)
    _seq(() => it)
    for await (const _ of _seq(() => it)) {
        break
    }
    expect(it.next).toHaveBeenCalledTimes(1)
})

it("converts from function returning iterable", async () => {
    const iterable = _seq(() => [1, 2])
    expect(await iterable._qr).toEqual([1, 2])
})

declare.it("can specify type when converting from empty array", expect => {
    const s = _seq<1>([])
    void expect(type_of(s)).to_equal(type<_Seq<1>>)
})

it("works for array-like objects", async () => {
    const arrayLike = { 0: 10, 1: 20, 2: 30, length: 3 }
    await expect(_seq(arrayLike)._qr).resolves.toEqual([10, 20, 30])
    const int32Array = new Int32Array([1, 2, 3])
    await expect(_seq(int32Array)._qr).resolves.toEqual([1, 2, 3])
    const emptyArrayLike = { length: 0 }
    await expect(_seq(emptyArrayLike)._qr).resolves.toEqual([])
})
