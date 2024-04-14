import { expect } from "@assertive-ts/core"
import { aseqs } from "@lib"

it("should filter prototypes", async () => {
    const stuffs = aseqs.of(1, new Map(), new Set())
    const filtered = stuffs.extractTypes(Map)
    expect(await filtered.toArray().pull()).toBeEqual([new Map()])
})

it("should do nothing on empty", async () => {
    const stuffs = aseqs.empty().extractTypes(Map)
    expect(await stuffs.some().pull()).toBe(false)
})

it("should work with Number objects", () => {})
