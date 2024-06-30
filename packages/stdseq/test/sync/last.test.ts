import { seq } from "@lib"

it("should return null for empty", () => {
    expect(seq.empty().first().pull()).toBe(undefined)
})

it("accepts default value", () => {
    expect(seq.empty().first(1).pull()).toBe(1)
})

it("should return first element", () => {
    expect(seq.of(3, 2, 3).first().pull()).toBe(3)
})
