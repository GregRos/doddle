import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("should give empty set on empty", async () => {
    const s = await aseq().toSet().pull()
    expect(s).toBeEqual(new Set())
})

it("should convert to set", async () => {
    const s = await aseqs.of(1, 2, 3).toSet().pull()
    expect(s).toBeEqual(new Set([1, 2, 3]))
})

it("should remove duplicates", async () => {
    const s = await aseqs.of(1, 2, 2, 3, 3, 3).toSet().pull()
    expect(s).toBeEqual(new Set([1, 2, 3]))
})
