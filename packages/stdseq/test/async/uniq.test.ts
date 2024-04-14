import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("should return unique elements", async () => {
    const s = aseqs.of(1, 2, 2, 3, 4, 4, 5)
    const result = await s.uniq().toArray().pull()
    expect(result).toBeEqual([1, 2, 3, 4, 5])
})

it("should return empty sequence for empty input", async () => {
    const s = aseqs.empty<number>()
    const result = await s.uniq().toArray().pull()
    expect(result).toBeEqual([])
})
