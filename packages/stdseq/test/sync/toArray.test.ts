import { seq } from "@lib"
// Tests for Seq.toArray
it("should convert sequence to array", () => {
    const s = seq.of(1, 2, 3)
    const array = s.toArray()
    expect(array.pull()).toEqual([1, 2, 3])
})

it("should convert empty sequence to empty array", () => {
    const s = seq.empty()
    const array = s.toArray()
    expect(array.pull()).toEqual([])
})

it("should convert sequence with one element to array", () => {
    const s = seq.of(1)
    const array = s.toArray()
    expect(array.pull()).toEqual([1])
})
