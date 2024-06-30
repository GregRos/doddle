import { seq } from "@lib"
it("get at 0", () => {
    const s = seq.of(1, 2, 3)
    expect(s.at(0).pull()).toEqual(1)
})

it("get at number", () => {
    const s = seq.of(1, 2, 3)
    expect(s.at(1).pull()).toEqual(2)
})

it("get at missing index is undefined", () => {
    const s = seq.of(1, 2, 3)
    expect(s.at(3).pull()).toBeNull()
})

it("get at negative index", () => {
    const s = seq.of(1, 2, 3)
    expect(s.at(-1).pull()).toEqual(3)
})
