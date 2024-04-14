import { expect } from "@assertive-ts/core"
import { aseqs } from "@lib"

it("should do nothing on empty", async () => {
    const a = aseqs.empty().skip(1)
    expect(await a.some().pull()).toBeEqual(false)
})

it("should skip", async () => {
    const a = aseqs.of(1, 2, 3).skip(1)
    expect(await a.toArray().pull()).toBeEqual([2, 3])
})

it("should skip all", async () => {
    const a = aseqs.of(1, 2, 3).skip(3)
    expect(await a.toArray().pull()).toBeEqual([])
})

it("should skip more than all", async () => {
    const a = aseqs.of(1, 2, 3).skip(4)
    expect(await a.toArray().pull()).toBeEqual([])
})
