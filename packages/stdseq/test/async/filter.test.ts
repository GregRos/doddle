import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("empty sequence", async () => {
    const s = aseqs.empty().filter(async () => false)
    expect(await s.toArray().pull()).toBeEqual([])
})

it("single element", async () => {
    const s = aseqs.of(1).filter(async () => true)
    expect(await s.toArray().pull()).toBeEqual([1])
})

it("multiple elements", async () => {
    const s = aseqs.of(1, 2, 3).filter(async v => v % 2 === 0)
    expect(await s.toArray().pull()).toBeEqual([2])
})

it("no elements", async () => {
    const s = aseqs.of(1, 2, 3).filter(async () => false)
    expect(await s.toArray().pull()).toBeEqual([])
})
