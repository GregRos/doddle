import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

describe("no predicate", () => {
    it("gives false if empty", async () => {
        expect(await aseqs.empty<number>().some().pull()).toBeEqual(false)
    })

    it("gives true if single element", async () => {
        expect(await aseqs.of(1).some().pull()).toBeEqual(true)
    })
})

describe("predicate", () => {
    it("gives false if empty", async () => {
        expect(
            await aseqs
                .empty<number>()
                .some(async () => true)
                .pull()
        ).toBeEqual(false)
    })

    it("gives true if single element", async () => {
        expect(
            await aseqs
                .of(1)
                .some(async () => true)
                .pull()
        ).toBeEqual(true)
    })

    it("gives false if predicate is false", async () => {
        expect(
            await aseqs
                .of(1)
                .some(async () => false)
                .pull()
        ).toBeEqual(false)
    })

    it("gives true if predicate is true", async () => {
        expect(
            await aseqs
                .of(1)
                .some(async () => true)
                .pull()
        ).toBeEqual(true)
    })

    it("gives true if predicate is true for some", async () => {
        expect(
            await aseqs
                .of(1, 2, 3)
                .some(async v => v === 2)
                .pull()
        ).toBeEqual(true)
    })

    it("gives false if predicate is false for all", async () => {
        expect(
            await aseqs
                .of(1, 2, 3)
                .some(async v => v === 4)
                .pull()
        ).toBeEqual(false)
    })
})
