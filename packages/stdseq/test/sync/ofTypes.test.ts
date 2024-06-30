import { seq } from "@lib"
it("should filter prototypes", () => {
    const stuffs = seq.of(1, new Map(), new Set())
    const filtered = stuffs.extractTypes(Map)
    expect(filtered.toArray().pull()).toEqual([new Map()])
})

it("should do nothing on empty", () => {
    const stuffs = seq.empty().extractTypes(Map)
    expect(stuffs.some().pull()).toBe(false)
})

it("should work with Number objects", () => {})
