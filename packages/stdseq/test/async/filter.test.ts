import { aseq } from "@lib"

it("empty sequence", async () => {
    const s = aseq.empty().filter(async () => false)
    expect(await s.toArray().pull()).toEqual([])
})

it("single element", async () => {
    const s = aseq.of(1).filter(async () => true)
    expect(await s.toArray().pull()).toEqual([1])
})

it("multiple elements", async () => {
    const s = aseq.of(1, 2, 3).filter(async v => v % 2 === 0)
    expect(await s.toArray().pull()).toEqual([2])
})

it("no elements", async () => {
    const s = aseq.of(1, 2, 3).filter(async () => false)
    expect(await s.toArray().pull()).toEqual([])
})
