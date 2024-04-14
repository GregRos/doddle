import { expect } from "@assertive-ts/core"
import { aseqs } from "@lib"

it("should work with empty input", async () => {
    const s = aseqs.empty().concatMap(async x => aseqs.of(x, x))
    expect(await s.toArray().pull()).toBeEqual([])
})

it("should work with single element", async () => {
    const s = aseqs.of(1).concatMap(async x => aseqs.of(x, x))
    expect(await s.toArray().pull()).toBeEqual([1, 1])
})

it("should work with multiple elements", async () => {
    const s = aseqs.of(1, 2, 3).concatMap(async x => aseqs.of(x, x))
    expect(await s.toArray().pull()).toBeEqual([1, 1, 2, 2, 3, 3])
})

it("should work with empty output", async () => {
    const s = aseqs.of(1, 2, 3).concatMap(async x => aseqs.empty())
    expect(await s.toArray().pull()).toBeEqual([])
})
