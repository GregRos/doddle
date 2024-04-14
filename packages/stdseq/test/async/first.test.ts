import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("should return null for empty", async () => {
    expect(await aseqs.empty().first().pull()).toBe(null)
})

it("accepts default value", async () => {
    expect(await aseqs.empty().first(1).pull()).toBe(1)
})

it("should return first element", async () => {
    expect(await aseqs.of(1, 2, 3).first().pull()).toBe(1)
})
