import { aseq } from "@lib"

it("should concat empty sequences", async () => {
    const s1 = aseq.empty<number>()
    const s2 = aseq.empty<number>()
    const result = await s1.concat(s2).toArray().pull()
    expect(result).toEqual([])
})

it("should concat non-empty sequences", async () => {
    const s1 = aseq.of(1, 2, 3)
    const s2 = aseq.of(4, 5, 6)
    const result = await s1.concat(s2).toArray().pull()
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
})

it("should concat multiple sequences", async () => {
    const s1 = aseq.of(1, 2)
    const s2 = aseq.of(3, 4)
    const s3 = aseq.of(5, 6)
    const result = await s1.concat(s2, s3).toArray().pull()
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
})
