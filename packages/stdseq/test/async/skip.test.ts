import { aseq } from "@lib"

it("should do nothing on empty", async () => {
    const a = aseq.empty().skip(1)
    expect(await a.some().pull()).toEqual(false)
})

it("should skip", async () => {
    const a = aseq.of(1, 2, 3).skip(1)
    expect(await a.toArray().pull()).toEqual([2, 3])
})

it("should skip all", async () => {
    const a = aseq.of(1, 2, 3).skip(3)
    expect(await a.toArray().pull()).toEqual([])
})

it("should skip more than all", async () => {
    const a = aseq.of(1, 2, 3).skip(4)
    expect(await a.toArray().pull()).toEqual([])
})
