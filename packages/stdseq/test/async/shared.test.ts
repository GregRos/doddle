import { expect } from "@assertive-ts/core"
import { aseqs } from "@lib"

it("should share the same iterator across multiple consumers", async () => {
    const s = aseqs.of(1, 2, 3, 4, 5).shared()
    const consumer1 = await s.toArray().pull()
    const consumer2 = await s.toArray().pull()
    expect(consumer1).toBeEqual([1, 2, 3, 4, 5])
    expect(consumer2).toBeEqual([])
})
