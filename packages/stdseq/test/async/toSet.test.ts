import { aseq } from "@lib"

it("should give empty set on empty", async () => {
    const s = await aseq().toSet().pull()
    expect(s).toEqual(new Set())
})

it("should convert to set", async () => {
    const s = await aseq.of(1, 2, 3).toSet().pull()
    expect(s).toEqual(new Set([1, 2, 3]))
})

it("should remove duplicates", async () => {
    const s = await aseq.of(1, 2, 2, 3, 3, 3).toSet().pull()
    expect(s).toEqual(new Set([1, 2, 3]))
})
