import { aseqs } from "@lib"

it("should concat empty sequences", async () => {
    const s1 = aseqs.empty<number>()
    const s2 = aseqs.empty<number>()
    const result = await s1.concat(s2).toArray().pull()
    expect(result).toEqual([])
})

it("should concat non-empty sequences", async () => {
    const s1 = aseqs.of(1, 2, 3)
    const s2 = aseqs.of(4, 5, 6)
    const result = await s1.concat(s2).toArray().pull()
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
})

it("should concat multiple sequences", async () => {
    const s1 = aseqs.of(1, 2)
    const s2 = aseqs.of(3, 4)
    const s3 = aseqs.of(5, 6)
    const result = await s1.concat(s2, s3).toArray().pull()
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
})
