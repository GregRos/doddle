import { seq } from "@lib"
it("empty on empty", () => {
    const a = seq.empty().takeLast(1)
    expect(a.some().pull()).toBe(false)
})

it("should take last", () => {
    const a = seq.of(1, 2, 3).takeLast(1)
    expect(a.toArray().pull()).toEqual([3])
})

it("should take last 2", () => {
    const a = seq.of(1, 2, 3).takeLast(2)
    expect(a.toArray().pull()).toEqual([2, 3])
})

it("should take everything when shorter", () => {
    const a = seq.of(1, 2, 3).takeLast(4)
    expect(a.toArray().pull()).toEqual([1, 2, 3])
})

it("should take nothing when 0", () => {
    const a = seq.of(1, 2, 3).takeLast(0)
    expect(a.toArray().pull()).toEqual([])
})
