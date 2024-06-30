import { seq } from "@lib"

it("undefined if empty", () => {
    const s = seq().maxBy(x => x)
    expect(s.pull()).toBeUndefined()
})

it("single element", () => {
    const s = seq.of(1).maxBy(x => x)
    expect(s.pull()).toBe(1)
})

it("multiple elements", () => {
    const s = seq.of(3, 1, 2).maxBy(x => x)
    expect(s.pull()).toBe(1)
})

it("multiple elements with key", () => {
    const s = seq.of(3, 1, 2).maxBy(x => x)
    expect(s.pull()).toBe(3)
})
