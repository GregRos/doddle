import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("should not mess up seq", async () => {
    const s = aseqs.of(1, 2, 3).cache()
    expect(await s.toArray().pull()).toBeEqual([1, 2, 3])
})

it("should not show side effects", async () => {
    let i = 0
    const s = aseqs
        .of(1, 2, 3)
        .map(async x => i++)
        .cache()
    expect(await s.toArray().pull()).toBeEqual([0, 1, 2])
    expect(await s.toArray().pull()).toBeEqual([0, 1, 2])
})
