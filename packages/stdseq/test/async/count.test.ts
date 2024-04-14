import { expect } from "@assertive-ts/core"
import { aseq } from "@lib"

it("should return the number of items in the sequence", async () => {
    const seq = aseq([1, 2, 3, 4, 5])
    const count = await seq.count().pull()
    expect(count).toBe(5)
})

it("should return 0 for an empty sequence", async () => {
    const seq = aseq([])
    const count = await seq.count().pull()
    expect(count).toBe(0)
})

it("should count the number of items that satisfy a predicate", async () => {
    const seq = aseq([1, 2, 3, 4, 5])
    const count = await seq.count(async x => x > 3).pull()
    expect(count).toBe(2)
})
