import { aseq } from "../aseq"
import { Seq, seq } from "../seq"
import { declare, type, type_of } from "declare-it"

describe("sync", () => {
    describe("0 arguments", () => {
        declare.test("type stays never", expect => {
            const s = seq().append()
            expect(type_of(s)).to_equal(type<Seq<never>>)
        })
        it("stays empty", () => {
            const s = seq().append()
            expect(s._qr).toEqual([])
        })
        it("stays with same elements", () => {
            const s = seq([1, 2, 3]).append()
            expect(s._qr).toEqual([1, 2, 3])
        })
    })
    describe("1 argument", () => {
        declare.test("disjunction with input type", expect => {
            const s = seq(["a", "b"]).append(1)
            expect(type_of(s)).to_equal(type<Seq<string | number>>)
        })
        it("appends one element", () => {
            const s = seq([1, 2, 3]).append(4)
            expect(s._qr).toEqual([1, 2, 3, 4])
        })
        it("appends one element to empty", () => {
            const s = seq().append(4)
            expect(s._qr).toEqual([4])
        })
    })
})

it("tests", () => {
    const s = seq()
    const a = s.append()
})
