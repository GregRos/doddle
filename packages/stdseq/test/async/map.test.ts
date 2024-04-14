import { expect } from "@assertive-ts/core"
import { aseqs } from "@lib"

it("should leave it empty", async () => {
    const s = aseqs.empty().map(X => 1)
    expect(await s.some().pull()).toBe(false)
})

it("should map", async () => {
    const s = aseqs.of(1, 2, 3).map(v => v + 1)
    expect(await s.toArray().pull()).toBeEqual([2, 3, 4])
})
