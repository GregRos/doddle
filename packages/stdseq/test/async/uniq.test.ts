import { aseq } from "@lib"

it("should return unique elements", async () => {
    const s = aseq.of(1, 2, 2, 3, 4, 4, 5)
    const result = await s.uniq().toArray().pull()
    expect(result).toEqual([1, 2, 3, 4, 5])
})

it("should return empty sequence for empty input", async () => {
    const s = aseq.empty<number>()
    const result = await s.uniq().toArray().pull()
    expect(result).toEqual([])
})
