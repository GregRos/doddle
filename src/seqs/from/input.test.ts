import { declare, type, type_of } from "declare-it"
import { seq } from "../seq/seq.ctor"
import type { Seq } from "../seq/seq.class"

// tests seq(...) and aseq(...) constructors
describe("sync", () => {
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

    function* exampleIterable() {
        yield 1
        yield 2
    }
    it("empty argslist gives empty seq", () => {
        expect(_seq()._qr).toEqual([])
    })
    it("converts from array", () => {
        expect(_seq([1, 2, 3])._qr).toEqual([1, 2, 3])
    })
    it("converts from empty array", () => {
        expect(_seq([])._qr).toEqual([])
    })
    it("converts from iterable", () => {
        const iterable = seq(exampleIterable())
        expect(iterable._qr).toEqual([1, 2])
    })
    it("converts from function returning iterator", () => {
        const iterable = seq(() => [1, 2][Symbol.iterator]())
        expect(iterable._qr).toEqual([1, 2])
    })
    it("converts from function returning iterable", () => {
        const iterable = seq(() => [1, 2])
        expect(iterable._qr).toEqual([1, 2])
    })

    declare.it("can specify type when converting from array", expect => {
        const s = _seq<1>([1])
        expect(type_of(s)).to_equal(type<_Seq<1>>)
        const s2 = _seq<number>()
    })
    declare.it("can specify type when converting from empty array", expect => {
        const s = _seq<1>([])
        expect(type_of(s)).to_equal(type<_Seq<1>>)
    })

    declare.it("can specify type when converting from nothing", expect => {
        const s = _seq<1>()
        expect(type_of(s)).to_equal(type<_Seq<1>>)
    })
})
