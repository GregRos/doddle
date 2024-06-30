import { seq } from "@lib"
it("true on empty", () => {
    const s = seq.empty().every(() => false)
    expect(s.pull()).toBe(true)
})

it("false on once", () => {
    const s = seq.of(1).every(() => false)
    expect(s.pull()).toBe(false)
})

it("evaluates", () => {
    const s = seq.of(1, 2, 3).every(v => v < 4)
    expect(s.pull()).toBe(true)
})
