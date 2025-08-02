import { DoddleError } from "@error"
import type { ASeq } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

declare.it("type defaults to ASeq<never>", expect => {
    expect(type_of(aseq.throws(() => new Error("a")))).to_equal(type<ASeq<never>>)
})

declare.it("type can be specified explicitly", expect => {
    expect(type_of(aseq.throws<string>(() => new Error("a")))).to_equal(type<ASeq<string>>)
})

it("throws error when iterated", async () => {
    const err = new Error("error")
    const s = aseq.throws(() => err)
    await expect(async () => {
        for await (const _ of s) {
            /* iteration */
        }
    }).rejects.toThrow(err)
})

it("throws error based on function returning Error", async () => {
    const s = aseq.throws(() => new Error("error"))
    await expect(async () => {
        for await (const _ of s) {
        }
    }).rejects.toThrow("error")
})

it("works when appended to another aseq", async () => {
    const each = jest.fn()
    const s = aseq([1, 2, 3])
        .concat(aseq.throws(() => new Error("error")))
        .each(each)
    await expect(async () => {
        for await (const _ of s) {
            /* iteration */
        }
    }).rejects.toThrow("error")
    expect(each).toHaveBeenCalledTimes(3)
})

describe("invalid input", () => {
    it("throws TypeError when iterated if given a function returning null", async () => {
        const s = aseq.throws(() => null as any)
        await expect(async () => {
            for await (const _ of s) {
                /* iteration */
            }
        }).rejects.toThrow(DoddleError)
    })

    it("throws TypeError if given null", async () => {
        await expect(async () => aseq.throws(null as any)).rejects.toThrow(DoddleError)
    })

    it("throws TypeError if given undefined", async () => {
        await expect(async () => aseq.throws(undefined as any)).rejects.toThrow(DoddleError)
    })
})
