import { seq } from "@lib"
it("should work with empty input", () => {
    const s = seq.empty().concatMap(x => seq.of(x, x))
    expect(s.toArray().pull()).toEqual([])
})

it("should work with single element", () => {
    const s = seq.of(1).concatMap(x => seq.of(x, x))
    expect(s.toArray().pull()).toEqual([1, 1])
})

it("should work with multiple elements", () => {
    const s = seq.of(1, 2, 3).concatMap(x => seq.of(x, x))
    expect(s.toArray().pull()).toEqual([1, 1, 2, 2, 3, 3])
})

it("should work with empty output", () => {
    const s = seq.of(1, 2, 3).concatMap(x => seq.empty())
    expect(s.toArray().pull()).toEqual([])
})

test.each([
    ["array", [[1, 1]]],
    ["seq", seq([[1, 1]])],
    ["set", new Set([[1, 1]])],
    ["map", new Map([[1, 1]])]
] as const)("should work with single input and %s output", (_, input) => {
    const s = seq.of(1).concatMap(x => input)
    expect(s.toArray().pull()).toEqual([[1, 1]])
})
