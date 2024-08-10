import { Doddle } from "@error"
import type { ASeq } from "@lib"
import { aseq, lazy, type Lazy } from "@lib"
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

declare.it("element type same as lazy's value type", expect => {
    const s = _seq(lazy(() => 1))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("element type is lazy value type for lazy async", expect => {
    const s = _seq(lazy(async () => 1))
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("element type is lazy value type for iterable of lazy", expect => {
    const s = _seq(null! as Iterable<Lazy<number>>)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("element type ivalue type for iterable of lazy async", expect => {
    const s = _seq(null! as Iterable<Lazy<Promise<number>>>)
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

it("empty argslist gives empty aseq", async () => {
    expect(await _seq()._qr).toEqual([])
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

it("converts from lazy", async () => {
    const iterable = _seq(lazy(() => 1))
    expect(await iterable._qr).toEqual([1])
})

it("converts from function returning lazy", async () => {
    const iterable = _seq(() => lazy(() => 1))
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

it("converts from function returning an async lazy", async () => {
    const iterable = _seq(() => lazy(async () => 1))
    expect(await iterable._qr).toEqual([1])
})

it("errors if given iterator directly", async () => {
    await expect(async () => await _seq(new Dummy._Iterator() as any)._qr).rejects.toThrow(Doddle)
})

it("errors on iteration when given a function returning something else", async () => {
    const iterable = _seq(() => 1 as any)
    await expect(async () => {
        for await (const _ of iterable) {
        }
    }).rejects.toThrow(Doddle)
})

it("errors when iterated if source errors", async () => {
    const iterable = _seq(function* () {
        throw new Error("source error")
    })
    await expect(async () => {
        for await (const _ of iterable) {
        }
    }).rejects.toThrow("source error")
})

it("errors when iterated if source errors with async", async () => {
    const iterable = _seq(async function* () {
        throw new Error("source error")
    })
    await expect(async () => {
        for await (const _ of iterable) {
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

declare.it("can specify type when converting from array", expect => {
    const s = _seq<1>([1])
    expect(type_of(s)).to_equal(type<_Seq<1>>)
    _seq<number>()
})

declare.it("can specify type when converting from empty array", expect => {
    const s = _seq<1>([])
    expect(type_of(s)).to_equal(type<_Seq<1>>)
})
