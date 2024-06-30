import { seq } from "@lib"

it("should not find in empty", () => {
    expect(seq.empty<number>().includes(1).pull()).toBe(false)
})

it("should find", () => {
    expect(seq.of(1, 2, 3).includes(2).pull()).toBe(true)
})

it("should not find", () => {
    expect(seq.of(1, 2, 3).includes(4).pull()).toBe(false)
})
