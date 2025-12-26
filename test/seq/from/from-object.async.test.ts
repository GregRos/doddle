import type { ASeq } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq

type _Seq<T> = ASeq<T>

declare.it("is typed as ASeq of key-value tuples", expect => {
    const source = { a: 1, b: 2 } as const
    expect(type_of(_seq.fromObject(source))).to_equal(type<_Seq<["a" | "b", 1 | 2]>>)
})

it("works on empty input", async () => {
    expect(await _seq.fromObject({})._qr).toEqual([])
})

it("works on single key input", async () => {
    expect(await _seq.fromObject({ a: 1 })._qr).toEqual([["a", 1]])
})

it("works on larger object", async () => {
    expect(await _seq.fromObject({ a: 1, b: 2, c: 3 })._qr).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 3]
    ])
})

it("does not produce symbol keys", async () => {
    const sym = Symbol("hidden")
    const source: any = { [sym]: 1, a: 2 }
    expect(await _seq.fromObject(source)._qr).toEqual([["a", 2]])
})

it("does not produce non-enumerable kvps", async () => {
    const source: any = {}
    Object.defineProperty(source, "hidden", { value: 1, enumerable: false })
    Object.defineProperty(source, "visible", { value: 2, enumerable: true })
    expect(await _seq.fromObject(source)._qr).toEqual([["visible", 2]])
})

it("does not produce inherited kvps", async () => {
    const base = { inherited: 1 }
    const source = Object.create(base)
    source.own = 2
    expect(await _seq.fromObject(source)._qr).toEqual([["own", 2]])
})

it("values are produced lazily", async () => {
    const aSpy = jest.fn(() => 1)
    const bSpy = jest.fn(() => 2)
    const source: any = {}
    Object.defineProperty(source, "a", { get: aSpy, enumerable: true })
    Object.defineProperty(source, "b", { get: bSpy, enumerable: true })
    const iterable = _seq.fromObject(source)
    expect(aSpy).not.toHaveBeenCalled()
    expect(bSpy).not.toHaveBeenCalled()
    const iterator = iterable[Symbol.asyncIterator]()
    expect((await iterator.next()).value).toEqual(["a", 1])
    expect(aSpy).toHaveBeenCalledTimes(1)
    expect(bSpy).not.toHaveBeenCalled()
})

it("no side-effects after call", async () => {
    const getter = jest.fn(() => 1)
    const source: any = {}
    Object.defineProperty(source, "a", { get: getter, enumerable: true })
    const iterable = _seq.fromObject(source)
    expect(getter).not.toHaveBeenCalled()
    void iterable
    expect(getter).not.toHaveBeenCalled()
})

it("array input produces numeric string keys", async () => {
    expect(await _seq.fromObject(["a", "b"])._qr).toEqual([
        ["0", "a"],
        ["1", "b"]
    ])
})
