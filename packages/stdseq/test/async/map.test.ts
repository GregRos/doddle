import { aseq } from "@lib"

it("should leave it empty", async () => {
    const s = aseq.empty().map(X => 1)
    expect(await s.some().pull()).toBe(false)
})

it("should map", async () => {
    const s = aseq.of(1, 2, 3).map(v => v + 1)
    expect(await s.toArray().pull()).toEqual([2, 3, 4])
})
