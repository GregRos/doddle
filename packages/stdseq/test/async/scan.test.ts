import { aseq } from "@lib"

it("should perform scan operation", async () => {
    const s = aseq.of(1, 2, 3, 4, 5)
    const result = await s
        .scan(async (acc, x) => acc + x, 0)
        .toArray()
        .pull()
    expect(result).toEqual([1, 3, 6, 10, 15])
})

it("should return empty sequence for empty input", async () => {
    const s = aseq.empty<number>()
    const result = await s
        .scan(async (acc, x) => acc + x, 0)
        .toArray()
        .pull()
    expect(result).toEqual([])
})
