import { expect } from "@assertive-ts/core"
import { seqs } from "@lib"
it("should filter prototypes", () => {
    const stuffs = seqs.of(1, new Map(), new Set())
    const filtered = stuffs.extractTypes(Map)
    expect(filtered.toArray().pull()).toBeEqual([new Map()])
})

it("should do nothing on empty", () => {
    const stuffs = seqs.empty().extractTypes(Map)
    expect(stuffs.some().pull()).toBe(false)
})

it("should work with Number objects", () => {})
