import { aseq } from "@lib"

it("empty on empty", async () => {
    const a = aseq.empty().takeLast(1)
    expect(await a.some().pull()).toBe(false)
})

it("should take last", async () => {
    const a = aseq.of(1, 2, 3).takeLast(1)
    expect(await a.toArray().pull()).toEqual([3])
})

it("should take last 2", async () => {
    const a = aseq.of(1, 2, 3).takeLast(2)
    expect(await a.toArray().pull()).toEqual([2, 3])
})

it("should take everything when shorter", async () => {
    const a = aseq.of(1, 2, 3).takeLast(4)
    expect(await a.toArray().pull()).toEqual([1, 2, 3])
})

it("should take nothing when 0", async () => {
    const a = aseq.of(1, 2, 3).takeLast(0)
    expect(await a.toArray().pull()).toEqual([])
})
