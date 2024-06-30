import { aseq } from "@lib"

it("should order elements based on key function", async () => {
    const s = aseq.of(3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5)
    const result = await s
        .orderBy(x => x)
        .toArray()
        .pull()
    expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9])
})

it("should return empty sequence for empty input", async () => {
    const s = aseq.empty<number>()
    const result = await s
        .orderBy(async x => x)
        .toArray()
        .pull()
    expect(result).toEqual([])
})
