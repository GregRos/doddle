import { aseq } from "@lib"

it("should share the same iterator across multiple consumers", async () => {
    const s = aseq.of(1, 2, 3, 4, 5).shared()
    const consumer1 = await s.toArray().pull()
    const consumer2 = await s.toArray().pull()
    expect(consumer1).toEqual([1, 2, 3, 4, 5])
    expect(consumer2).toEqual([])
})
