import { aseq } from "@lib"

it("should return null for empty", async () => {
    expect(await aseq.empty().first().pull()).toBe(null)
})

it("accepts default value", async () => {
    expect(await aseq.empty().first(1).pull()).toBe(1)
})

it("should return first element", async () => {
    expect(await aseq.of(3, 2, 3).first().pull()).toBe(3)
})
