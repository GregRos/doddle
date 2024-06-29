import { aseqs } from "@lib"

it("should convert sequence to array", async () => {
    const s = aseqs.of(1, 2, 3)
    const array = await s.toArray().pull()
    expect(array).toEqual([1, 2, 3])
})

it("should convert empty sequence to empty array", async () => {
    const s = aseqs.empty()
    const array = await s.toArray().pull()
    expect(array).toEqual([])
})

it("should convert sequence with one element to array", async () => {
    const s = aseqs.of(1)
    const array = await s.toArray().pull()
    expect(array).toEqual([1])
})
