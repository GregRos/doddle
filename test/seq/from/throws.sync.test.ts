import { DoddleError } from "@error"
import type { Seq } from "@lib"
import { seq } from "@lib"
import { declare, type, type_of } from "declare-it"
declare.it("type defaults to Seq<never>", expect => {
    expect(type_of(seq.throws(() => new Error()))).to_equal(type<Seq<never>>)
})

declare.it("type can be specified explicitly", expect => {
    expect(type_of(seq.throws<string>(() => new Error("a")))).to_equal(type<Seq<string>>)
})

it("throws error when iterated", () => {
    const err = new Error("error")
    const s = seq.throws(() => err)
    expect(() => [...s]).toThrow(err)
})

it("throws error based on function returning Error", () => {
    const s = seq.throws(() => new Error("error"))
    expect(() => {
        for (const _ of s) {
            // Drain
        }
    }).toThrow("error")
})

it("works when appended to another seq", () => {
    const each = jest.fn()
    const s = seq([1, 2, 3])
        .concat(seq.throws(() => new Error("error")))
        .each(each)
    expect(() => [...s]).toThrow("error")
    expect(each).toHaveBeenCalledTimes(3)
})

describe("invalid input", () => {
    it("throws TypeError when iterated if given a function returning null", () => {
        const s = seq.throws(() => null as any)
        expect(() => [...s]).toThrow(DoddleError)
    })

    it("throws TypeError if given null", () => {
        expect(() => seq.throws(null as any)).toThrow(DoddleError)
    })

    it("throws TypeError if given undefined", () => {
        expect(() => seq.throws(undefined as any)).toThrow(DoddleError)
    })
})
