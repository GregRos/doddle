import { aseq } from "@lib"

it("should not find in empty", async () => {
    expect(await aseq.empty<number>().includes(1).pull()).toBe(false)
})

it("should find", async () => {
    expect(await aseq.of(1, 2, 3).includes(2).pull()).toBe(true)
})

it("should not find", async () => {
    expect(await aseq.of(1, 2, 3).includes(4).pull()).toBe(false)
})
