import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("should do nothing on empty", async () => {
    const a = aseqs.empty().index()
    expect(await a.some().pull()).toBe(false)
})

it("should attach index", async () => {
    const a = aseqs.of(1, 2, 3).index()
    expect(await a.toArray().pull()).toBeEqual([
        [0, 1],
        [1, 2],
        [2, 3]
    ])
})