import { aseq } from "@lib"

it("should work with empty input", async () => {
    const s = aseq.empty().concatMap(async x => aseq.of(x, x))
    expect(await s.toArray().pull()).toEqual([])
})

it("should work with single element", async () => {
    const s = aseq.of(1).concatMap(async x => aseq.of(x, x))
    expect(await s.toArray().pull()).toEqual([1, 1])
})

it("should work with multiple elements", async () => {
    const s = aseq.of(1, 2, 3).concatMap(async x => aseq.of(x, x))
    expect(await s.toArray().pull()).toEqual([1, 1, 2, 2, 3, 3])
})

it("should work with empty output", async () => {
    const s = aseq.of(1, 2, 3).concatMap(async x => aseq.empty())
    expect(await s.toArray().pull()).toEqual([])
})
