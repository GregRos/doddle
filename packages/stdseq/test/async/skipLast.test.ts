import { aseqs } from "@lib"

it("should empty on empty", async () => {
    const a = aseqs.empty().skipLast(1)
    expect(await a.some().pull()).toBe(false)
})

it("should skip last", async () => {
    const a = aseqs.of(1, 2, 3).skipLast(1)
    expect(await a.toArray().pull()).toEqual([1, 2])
})

it("should skip last 2", async () => {
    const a = aseqs.of(1, 2, 3).skipLast(2)
    expect(await a.toArray().pull()).toEqual([1])
})

it("should skip everything when shorter", async () => {
    const a = aseqs.of(1, 2, 3).skipLast(4)
    expect(await a.toArray().pull()).toEqual([])
})

it("should skip nothing when 0", async () => {
    const a = aseqs.of(1, 2, 3).skipLast(0)
    expect(await a.toArray().pull()).toEqual([1, 2, 3])
})
