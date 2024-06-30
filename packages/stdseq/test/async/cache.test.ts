import { aseq } from "@lib"

it("should not mess up seq", async () => {
    const s = aseq.of(1, 2, 3).cache()
    expect(await s.toArray().pull()).toEqual([1, 2, 3])
})

it("should not show side effects", async () => {
    let i = 0
    const s = aseq
        .of(1, 2, 3)
        .map(async x => i++)
        .cache()
    expect(await s.toArray().pull()).toEqual([0, 1, 2])
    expect(await s.toArray().pull()).toEqual([0, 1, 2])
})
