import { type Seq } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
const _seq = seq
type SType<T> = Seq<T>
describe("0 arguments", () => {
    declare.test("type stays never", expect => {
        const sNever = _seq().append()
        expect(type_of(sNever)).to_equal(type<SType<never>>)
        const sNumber = _seq<number>().append()
        expect(type_of(sNumber)).to_equal(type<SType<number>>)
    })
    it("stays empty", () => {
        const s = _seq().append()
        expect(s._qr).toEqual([])
    })
    it("stays with same elements", () => {
        const s = _seq([1, 2, 3]).append()
        expect(s._qr).toEqual([1, 2, 3])
    })
})
describe("1 argument", () => {
    declare.test("disjunction with input type", expect => {
        const s = _seq(["a", "b"]).append(1)
        expect(type_of(s)).to_equal(type<SType<string | number>>)
    })
    declare.test("2 input types create disjunction", expect => {
        const s = _seq(["a", "b"]).append(1, true)
        expect(type_of(s)).to_equal(type<SType<string | number | boolean>>)
    })
    it("appends one element", () => {
        const s = _seq([1, 2, 3]).append(4)
        expect(s._qr).toEqual([1, 2, 3, 4])
    })
    it("appends one element to empty", () => {
        const s = _seq().append(4)
        expect(s._qr).toEqual([4])
    })
    it("appends to infinite passes", () => {
        const s = _seq.repeat(Infinity, 1).append(2)
        expect(s.take(3)._qr).toEqual([1, 1, 1])
    })
})

it("can iterate twice", () => {
    const s = _seq([1, 2, 3]).append(4)
    expect(s._qr).toEqual([1, 2, 3, 4])
    expect(s._qr).toEqual([1, 2, 3, 4])
})
