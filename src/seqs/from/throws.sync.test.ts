import { declare, type, type_of } from "declare-it"
import type { Seq } from "../../index.js"
import { seq } from "../../index.js"
declare.it("type defaults to Seq<never>", expect => {
    expect(type_of(seq.throws("error"))).to_equal(type<Seq<never>>)
})

declare.it("type can be specified explicitly", expect => {
    expect(type_of(seq.throws<string>("error"))).to_equal(type<Seq<string>>)
})

it("throws error when iterated", () => {
    const err = new Error("error")
    const s = seq.throws(err)
    expect(() => [...s]).toThrow(err)
})

it("throws error based on function returning Error", () => {
    const s = seq.throws(() => new Error("error"))
    expect(() => {
        for (const _ of s) {
        }
    }).toThrow("error")
})

it("throws error based on function returning string", () => {
    const s = seq.throws(() => "error")
    expect(() => {
        for (const _ of s) {
        }
    }).toThrow("error")
})

it("works when appended to another seq", () => {
    const each = jest.fn()
    const s = seq.of(1, 2, 3).concat(seq.throws("error")).each(each)
    expect(() => [...s]).toThrow("error")
    expect(each).toHaveBeenCalledTimes(3)
})

describe("invalid input", () => {
    it("throws TypeError when iterated if given a function returning null", () => {
        const s = seq.throws(() => null)
        expect(() => [...s]).toThrow(TypeError)
    })

    it("throws TypeError if given null", () => {
        expect(() => seq.throws(null)).toThrow(TypeError)
    })

    it("throws TypeError if given undefined", () => {
        expect(() => seq.throws(undefined)).toThrow(TypeError)
    })
})
