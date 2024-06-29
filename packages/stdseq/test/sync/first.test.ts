import { seqs } from "@lib"

it("should return null for empty", () => {
    expect(seqs.empty().first().pull()).toBe(null)
})

it("accepts default value", () => {
    expect(seqs.empty().first(1).pull()).toBe(1)
})

it("should return first element", () => {
    expect(seqs.of(1, 2, 3).first().pull()).toBe(1)
})
